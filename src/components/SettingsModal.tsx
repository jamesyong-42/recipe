import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronDown, Copy, Check, Loader2 } from 'lucide-react';
import { useSupabase } from '../contexts/SupabaseContext';
import {
  getEnvConfig,
  loadSnippetsFromStorage,
  saveSnippetsToStorage,
  loadSnippetsFromSupabase,
  addSnippetToSupabase,
} from '../lib/supabase';

const SETUP_SQL = `create table snippets (
  id text primary key,
  title text not null default 'Untitled',
  code text not null default '',
  type text not null default 'html'
    check (type in ('html', 'react')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table snippets enable row level security;

create policy "Allow all access" on snippets
  for all using (true) with check (true);`;

type ModalStep = 'main' | 'migrate-up' | 'migrate-down';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { client, isConnected, connectionSource, connect, disconnect, config } = useSupabase();

  const envConfig = getEnvConfig();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [sqlExpanded, setSqlExpanded] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [step, setStep] = useState<ModalStep>('main');
  const [migrating, setMigrating] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [cloudCount, setCloudCount] = useState(0);

  // Pre-fill inputs when modal opens
  useEffect(() => {
    if (isOpen) {
      if (config) {
        setUrl(config.url);
        setAnonKey(config.anonKey);
      } else if (envConfig) {
        setUrl(envConfig.url);
        setAnonKey(envConfig.anonKey);
      } else {
        setUrl('');
        setAnonKey('');
      }
      setMessage(null);
      setStep('main');
      setMigrating(false);
    }
  }, [isOpen, config, envConfig]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && step === 'main' && !testing && !migrating) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, step, testing, migrating]);

  const handleConnect = useCallback(async () => {
    if (!url.trim() || !anonKey.trim()) {
      setMessage({ type: 'error', text: 'Both fields are required.' });
      return;
    }

    setTesting(true);
    setMessage({ type: 'info', text: 'Testing connection...' });

    const result = await connect(url.trim(), anonKey.trim());

    if (!result.ok) {
      setMessage({ type: 'error', text: result.error || 'Connection failed.' });
      setTesting(false);
      return;
    }

    setTesting(false);

    // Check for local snippets to migrate
    const localSnippets = loadSnippetsFromStorage();
    if (localSnippets.length > 0) {
      setLocalCount(localSnippets.length);
      setStep('migrate-up');
      setMessage({ type: 'success', text: 'Connected successfully!' });
    } else {
      setMessage({ type: 'success', text: 'Connected successfully!' });
    }
  }, [url, anonKey, connect]);

  const handleDisconnect = useCallback(async () => {
    // Check for cloud snippets to download
    if (client) {
      const cloudSnippets = await loadSnippetsFromSupabase(client);
      if (cloudSnippets.length > 0) {
        setCloudCount(cloudSnippets.length);
        setStep('migrate-down');
        return;
      }
    }
    disconnect();
    setMessage({ type: 'info', text: 'Disconnected. Using local storage.' });
  }, [client, disconnect]);

  const handleMigrateUp = useCallback(async () => {
    if (!client) return;
    setMigrating(true);
    setMessage({ type: 'info', text: 'Uploading snippets...' });

    const localSnippets = loadSnippetsFromStorage();
    let uploaded = 0;
    for (const snippet of localSnippets) {
      const ok = await addSnippetToSupabase(client, snippet);
      if (ok) uploaded++;
    }

    setMigrating(false);
    setStep('main');
    setMessage({ type: 'success', text: `Uploaded ${uploaded} of ${localSnippets.length} snippets.` });
  }, [client]);

  const handleSkipMigrateUp = useCallback(() => {
    setStep('main');
    setMessage({ type: 'success', text: 'Connected. Local snippets were not uploaded.' });
  }, []);

  const handleMigrateDown = useCallback(async () => {
    if (!client) return;
    setMigrating(true);
    setMessage({ type: 'info', text: 'Downloading snippets...' });

    const cloudSnippets = await loadSnippetsFromSupabase(client);
    saveSnippetsToStorage(cloudSnippets);

    setMigrating(false);
    disconnect();
    setStep('main');
    setMessage({ type: 'info', text: `Downloaded ${cloudSnippets.length} snippets. Using local storage.` });
  }, [client, disconnect]);

  const handleSkipMigrateDown = useCallback(() => {
    disconnect();
    setStep('main');
    setMessage({ type: 'info', text: 'Disconnected. Using local storage.' });
  }, [disconnect]);

  const handleCopySQL = useCallback(async () => {
    await navigator.clipboard.writeText(SETUP_SQL);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && step === 'main' && !testing && !migrating) {
        onClose();
      }
    },
    [onClose, step, testing, migrating]
  );

  if (!isOpen) return null;

  const truncatedUrl = config?.url.replace(/^https?:\/\//, '').split('.')[0] || '';

  return (
    <div className="settings-backdrop" onClick={handleBackdropClick}>
      <div className="settings-modal">
        <div className="settings-header">
          <h2>Settings</h2>
          <button
            className="settings-close"
            onClick={onClose}
            disabled={testing || migrating}
          >
            <X size={16} />
          </button>
        </div>

        <div className="settings-body">
          {/* Connection Status */}
          <div className="settings-section">
            <p className="settings-section-title">Storage</p>
            <div className="settings-status">
              <span className={`settings-status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
              {isConnected ? (
                <>
                  <span>Cloud sync</span>
                  {connectionSource === 'env' && (
                    <span className="settings-status-url">(environment)</span>
                  )}
                  {connectionSource === 'runtime' && truncatedUrl && (
                    <span className="settings-status-url">({truncatedUrl})</span>
                  )}
                </>
              ) : (
                <span>Local storage</span>
              )}
            </div>
          </div>

          {/* Migration prompt: uploading local → cloud */}
          {step === 'migrate-up' && (
            <div className="settings-migration">
              <p>
                You have <strong>{localCount}</strong> snippet{localCount !== 1 ? 's' : ''} stored
                locally. Upload them to Supabase?
              </p>
              <div className="settings-actions">
                <button
                  className="settings-btn-primary"
                  onClick={handleMigrateUp}
                  disabled={migrating}
                >
                  {migrating && <Loader2 size={14} className="spin" />}
                  Upload
                </button>
                <button
                  className="settings-btn-secondary"
                  onClick={handleSkipMigrateUp}
                  disabled={migrating}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Migration prompt: downloading cloud → local */}
          {step === 'migrate-down' && (
            <div className="settings-migration">
              <p>
                You have <strong>{cloudCount}</strong> snippet{cloudCount !== 1 ? 's' : ''} in
                Supabase. Download them to local storage before disconnecting?
              </p>
              <div className="settings-actions">
                <button
                  className="settings-btn-primary"
                  onClick={handleMigrateDown}
                  disabled={migrating}
                >
                  {migrating && <Loader2 size={14} className="spin" />}
                  Download
                </button>
                <button
                  className="settings-btn-secondary"
                  onClick={handleSkipMigrateDown}
                  disabled={migrating}
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Message */}
          {message && step === 'main' && (
            <p className={`settings-message ${message.type}`}>{message.text}</p>
          )}

          {/* Connect / Disconnect actions */}
          {step === 'main' && (
            <>
              <hr className="settings-divider" />

              {isConnected && connectionSource === 'runtime' ? (
                <div className="settings-section">
                  <button className="settings-btn-danger" onClick={handleDisconnect}>
                    Disconnect from Supabase
                  </button>
                </div>
              ) : !isConnected || connectionSource === 'env' ? (
                <div className="settings-section">
                  <p className="settings-section-title">
                    {isConnected ? 'Change Connection' : 'Connect Supabase'}
                  </p>
                  {envConfig && !config && (
                    <p className="settings-note">Pre-filled from environment variables.</p>
                  )}
                  <label className="settings-label">Project URL</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-project.supabase.co"
                    disabled={testing}
                  />
                  <label className="settings-label">Anon Key</label>
                  <input
                    className="settings-input"
                    type="text"
                    value={anonKey}
                    onChange={(e) => setAnonKey(e.target.value)}
                    placeholder="your-anon-key"
                    disabled={testing}
                  />
                  <div className="settings-actions">
                    <button
                      className="settings-btn-primary"
                      onClick={handleConnect}
                      disabled={testing || !url.trim() || !anonKey.trim()}
                    >
                      {testing && <Loader2 size={14} className="spin" />}
                      {testing ? 'Testing...' : 'Test & Connect'}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Database Setup (collapsible) */}
              <hr className="settings-divider" />
              <div className="settings-section">
                <button
                  className="settings-collapsible"
                  onClick={() => setSqlExpanded(!sqlExpanded)}
                >
                  {sqlExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Database Setup
                </button>
                {sqlExpanded && (
                  <>
                    <p className="settings-note">
                      Run this SQL in your Supabase project's SQL Editor to create the required table:
                    </p>
                    <div className="settings-sql">{SETUP_SQL}</div>
                    <button className="settings-btn-secondary" onClick={handleCopySQL}>
                      {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                      {sqlCopied ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
