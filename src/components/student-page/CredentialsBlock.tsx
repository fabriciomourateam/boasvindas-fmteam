import { motion } from "framer-motion";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CredentialsBlockProps {
  appName: string;
  login: string;
  password: string;
  instructions?: string;
  tutorialImage?: string;
}

const CredentialsBlock = ({ appName, login, password, instructions, tutorialImage }: CredentialsBlockProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-5 rounded-lg border border-border bg-card"
    >
      <h4 className="font-display text-lg text-foreground mb-3">🔐 {appName}</h4>

      {instructions && (
        <p className="text-sm text-muted-foreground mb-4">{instructions}</p>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
          <div>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Login</span>
            <p className="text-sm font-mono font-semibold text-foreground">{login}</p>
          </div>
          <button
            onClick={() => copyToClipboard(login, "Login")}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {password && (
          <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Senha</span>
              <p className="text-sm font-mono font-semibold text-foreground">
                {showPassword ? password : "••••••••"}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(password, "Senha")}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {tutorialImage && (
        <div className="mt-5 rounded-lg overflow-hidden border border-border">
          <img
            src={tutorialImage}
            alt={`Tutorial ${appName}`}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
    </motion.div>
  );
};

export default CredentialsBlock;
