import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

const SettingsScreen: React.FC = () => {
  const { profile, updateSettings, resetProfile } = useUser();
  const [openAIKey, setOpenAIKey] = useState(profile?.settings.openAIKey ?? '');

  if (!profile) return null;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-indigo-400">Settings</p>
        <h1 className="text-3xl font-bold">Customize your experience</h1>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">AI coaching</h2>
        <p className="text-sm text-slate-400">Store your OpenAI key locally to enable post-session feedback.</p>
        <Input
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
          placeholder="sk-..."
          type="password"
        />
        <Button onClick={() => updateSettings({ openAIKey })}>Save key</Button>
      </div>

      <div className="card space-y-3 p-5">
        <h2 className="text-lg font-semibold">Data controls</h2>
        <p className="text-sm text-slate-400">Clear local cache and sign out.</p>
        <Button variant="ghost" onClick={resetProfile} className="text-red-300">
          Wipe local data
        </Button>
      </div>
    </div>
  );
};

export default SettingsScreen;
