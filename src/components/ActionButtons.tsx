
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Save, 
  RefreshCw, 
  Trash2, 
  Edit, 
  Eye, 
  Download,
  Upload,
  Send,
  Plus,
  Loader2
} from 'lucide-react';

interface ActionButtonProps {
  action: 'save' | 'refresh' | 'delete' | 'edit' | 'view' | 'download' | 'upload' | 'send' | 'add';
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  action,
  onClick,
  disabled = false,
  isLoading = false,
  children,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const [localLoading, setLocalLoading] = React.useState(false);

  const handleClick = async () => {
    if (disabled || isLoading || localLoading) return;

    try {
      setLocalLoading(true);
      await onClick();
    } catch (error) {
      console.error(`Erro na ação ${action}:`, error);
    } finally {
      setLocalLoading(false);
    }
  };

  const getIcon = () => {
    if (isLoading || localLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }

    switch (action) {
      case 'save': return <Save className="h-4 w-4" />;
      case 'refresh': return <RefreshCw className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      case 'edit': return <Edit className="h-4 w-4" />;
      case 'view': return <Eye className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'upload': return <Upload className="h-4 w-4" />;
      case 'send': return <Send className="h-4 w-4" />;
      case 'add': return <Plus className="h-4 w-4" />;
      default: return null;
    }
  };

  const getText = () => {
    if (isLoading || localLoading) return 'Carregando...';
    
    if (children) return children;
    
    switch (action) {
      case 'save': return 'Salvar';
      case 'refresh': return 'Atualizar';
      case 'delete': return 'Excluir';
      case 'edit': return 'Editar';
      case 'view': return 'Ver';
      case 'download': return 'Baixar';
      case 'upload': return 'Enviar';
      case 'send': return 'Enviar';
      case 'add': return 'Adicionar';
      default: return 'Ação';
    }
  };

  const getVariant = () => {
    if (action === 'delete') return 'destructive';
    return variant;
  };

  return (
    <Button
      variant={getVariant()}
      size={size}
      onClick={handleClick}
      disabled={disabled || isLoading || localLoading}
      className={`flex items-center gap-2 ${className}`}
    >
      {getIcon()}
      {size !== 'icon' && <span>{getText()}</span>}
    </Button>
  );
};

export default ActionButton;
