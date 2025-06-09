
-- Verificar se o usuário existe e torná-lo administrador
INSERT INTO public.usuarios (id, email, nome, tipo_usuario, peticoes_usadas)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'santoscydnei@gmail.com',
  'Santos Cydnei',
  'admin',
  0
)
ON CONFLICT (email) 
DO UPDATE SET tipo_usuario = 'admin';

-- Criar também um usuário demo admin para testes
INSERT INTO public.usuarios (id, email, nome, tipo_usuario, peticoes_usadas)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001'::uuid,
  'admin@demo.com',
  'Administrador Demo',
  'admin',
  0
)
ON CONFLICT (email) 
DO UPDATE SET tipo_usuario = 'admin';
