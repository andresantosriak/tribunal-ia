
-- Criar tabela de usuários
CREATE TABLE public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  tipo_usuario TEXT DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'usuario')),
  peticoes_usadas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de logs de uso
CREATE TABLE public.logs_uso (
  id SERIAL PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  caso_id TEXT,
  acao TEXT,
  timestamp_acao TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de configurações
CREATE TABLE public.configuracoes (
  id SERIAL PRIMARY KEY,
  webhook_url TEXT,
  max_peticoes_usuario INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar relacionamento entre casos e usuários
ALTER TABLE public.casos ADD COLUMN usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE;

-- Habilitar RLS nas tabelas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_uso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários (usuários podem ver apenas seus próprios dados)
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para logs (apenas admins podem ver todos os logs)
CREATE POLICY "Admins podem ver todos os logs" ON public.logs_uso
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir logs" ON public.logs_uso
  FOR INSERT WITH CHECK (true);

-- Políticas RLS para configurações (apenas admins)
CREATE POLICY "Admins podem ver configurações" ON public.configuracoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar configurações" ON public.configuracoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Admins podem inserir configurações" ON public.configuracoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- Políticas RLS para casos (usuários veem apenas seus casos, admins veem todos)
ALTER TABLE public.casos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios casos" ON public.casos
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Usuários podem inserir seus próprios casos" ON public.casos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Admins podem deletar casos" ON public.casos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.usuarios 
      WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- Função para criar perfil de usuário automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, nome, tipo_usuario, peticoes_usadas)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'usuario',
    0
  );
  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir configurações padrão
INSERT INTO public.configuracoes (webhook_url, max_peticoes_usuario) 
VALUES (NULL, 5)
ON CONFLICT DO NOTHING;
