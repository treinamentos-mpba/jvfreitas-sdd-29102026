# Discovery — Aplicação de Previsão do Tempo

## Contexto

A empresa solicitou uma aplicação de previsão do tempo para que usuários consultem informações meteorológicas de cidades. O briefing define quatro capacidades principais: buscar cidades, consultar o clima atual, visualizar a previsão dos próximos cinco dias e alternar entre Celsius e Fahrenheit. A aplicação também deve poder ser usada em dispositivos móveis.

O briefing ainda não especifica fonte ou cobertura dos dados, detalhes da previsão, critérios de desempenho, acessibilidade, idiomas ou comportamento em falhas. Esses pontos precisam ser esclarecidos antes de se tornarem compromissos de produto.

## Personas

> Personas hipotéticas, derivadas apenas do briefing. Validar com pesquisa antes de tratá-las como representativas dos usuários reais.

### 1. Decisor do clima do dia

- **Objetivo principal:** consultar rapidamente o clima atual de uma cidade para decidir como se vestir ou se preparar para sair.
- **Contexto de uso:** principalmente mobile, em momentos curtos antes de sair; desktop é secundário.
- **Métrica de sucesso do ponto de vista da persona:** encontrar a cidade correta e entender as condições atuais em até 30 segundos, sem ajuda. Meta inicial proposta: sucesso em pelo menos 4 de 5 tentativas em teste de usabilidade.

### 2. Planejador de viagem

- **Objetivo principal:** consultar a previsão de cinco dias do destino para planejar atividades e o que levar na viagem.
- **Contexto de uso:** desktop durante o planejamento; mobile para consultar novamente durante a viagem.
- **Métrica de sucesso do ponto de vista da persona:** localizar o destino correto e consultar a previsão completa de cinco dias em até 1 minuto. Meta inicial proposta: sucesso em pelo menos 4 de 5 tentativas em teste de usabilidade.

### 3. Pessoa que se prepara para atividade física ao ar livre

- **Objetivo principal:** consultar as condições do tempo para decidir se mantém uma atividade física ao ar livre e como se preparar para ela.
- **Contexto de uso:** principalmente mobile, antes de sair para treinar; desktop pode ser usado para comparar a previsão dos próximos dias e escolher quando praticar.
- **Métrica de sucesso do ponto de vista da persona:** encontrar a cidade e consultar as condições atuais ou a previsão relevante em até 1 minuto, obtendo informação suficiente para decidir como se preparar. Meta inicial proposta: concluir essa tarefa sem ajuda em pelo menos 4 de 5 tentativas de usabilidade.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário pesquise uma cidade.
- **RF2 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade consultada.
- **RF3 — Consultar previsão:** exibir a previsão para cinco dias.
- **RF4 — Alternar unidade:** permitir alternar a apresentação da temperatura entre Celsius e Fahrenheit.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade (explícito):** a aplicação deve funcionar de 320 px de largura até telas desktop, sem rolagem horizontal nem conteúdo ou controles essenciais cortados.
- **RNF2 — Usabilidade (proposta a validar):** os fluxos de buscar uma cidade, consultar o clima e alternar a unidade devem poder ser concluídos por toque em dispositivos móveis e por ponteiro em desktop, sem depender de interação exclusiva por hover.
- **RNF3 — Acessibilidade (a validar):** definir requisitos para teclado, leitores de tela, contraste e controles acessíveis.
- **RNF4 — Desempenho (a validar):** estabelecer metas para carregamento inicial e tempo de resposta das consultas.
- **RNF5 — Resiliência (a validar):** definir como a interface deve se comportar quando a conexão ou a fonte de dados estiver indisponível.

### Segurança (propostas para a arquitetura SPA)

- **RNF6 — Transporte seguro:** servir a aplicação somente por HTTPS e fazer chamadas às APIs externas exclusivamente por HTTPS, sem conteúdo misto.
- **RNF7 — Políticas do navegador:** publicar uma Content Security Policy restritiva, permitindo conexões apenas à origem da aplicação e aos endpoints Open-Meteo necessários; bloquear plugins e incorporação não autorizada da aplicação. Configurar também políticas adequadas de MIME, referrer e permissões no hosting quando suportadas. Validar essas políticas contra as limitações do hosting estático escolhido.
- **RNF8 — Proteção contra injeção e XSS:** tratar texto de busca e respostas da API como dados não confiáveis; validar o formato dos dados recebidos, renderizar texto sem interpretá-lo como HTML e não usar execução dinâmica de código ou inserção insegura de HTML.
- **RNF9 — Minimização e transparência de dados:** informar que a busca de cidades é enviada ao Open-Meteo; não armazenar buscas ou localização no servidor, nem solicitar geolocalização sem decisão explícita e consentimento. Qualquer armazenamento local, telemetria ou retenção adicional deve ter finalidade e prazo definidos antes de ser habilitado.
- **RNF10 — Segredos no cliente:** não incluir chaves privadas, tokens ou credenciais no bundle, no código-fonte ou em arquivos de configuração distribuídos ao navegador. A integração direta deve usar apenas endpoints públicos que não exijam segredo.
- **RNF11 — Segurança da cadeia de dependências:** manter dependências e lockfile revisados, executar verificação automatizada de vulnerabilidades no fluxo de entrega e não publicar com vulnerabilidades críticas ou altas conhecidas sem avaliação e aprovação documentadas.

## Riscos

| Categoria | Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- |
| Técnico | Indisponibilidade, mudança de contrato ou limitação de requisições do Open-Meteo, chamado diretamente pelo navegador | Média | Alto: usuários ficam sem dados atuais ou previsão | Confirmar disponibilidade, CORS, limites e termos de uso antes da implementação; isolar a integração em um adaptador; definir timeout, tratamento de erro e nova tentativa. Só adicionar cache se a política de dados for definida. |
| Técnico | Cobertura desigual, dados ausentes ou atualização menos frequente que a esperada | Média | Alto: pessoa toma decisão com informação incompleta ou desatualizada | Validar cobertura para as regiões prioritárias; validar campos e respostas; exibir horário de atualização e estado explícito quando os dados não estiverem disponíveis. |
| Técnico | Busca ambígua resolve para cidade errada ou confunde localidades homônimas | Média | Alto: toda a previsão apresentada pode se referir ao lugar errado | Mostrar cidade, região e país; permitir seleção explícita quando houver múltiplas correspondências e testar consultas com nomes repetidos. |
| Técnico | Rede lenta ou instável em dispositivos móveis interrompe a consulta | Alta | Médio: o fluxo principal demora ou falha | Definir timeout; manter estados de carregamento, erro e tentativa novamente; validar em redes lentas e perda de conexão sem apresentar dados antigos como atuais. |
| Técnico | Dados externos ou entrada de busca não tratados de forma segura permitem XSS ou quebram a interface | Baixa | Alto: execução de conteúdo não confiável no navegador ou indisponibilidade da tela | Validar o formato das respostas, renderizar valores como texto, evitar inserção insegura de HTML e aplicar CSP restritiva compatível com os endpoints necessários. |
| Técnico | Hosting estático não permite configurar as políticas de segurança planejadas ou é publicado sem HTTPS | Média | Alto: reduz proteção contra conteúdo malicioso, incorporação indevida ou interceptação | Confirmar capacidades do hosting antes de escolhê-lo; exigir HTTPS; configurar as políticas disponíveis e testar a configuração de segurança no ambiente publicado. |
| Técnico | Dependência vulnerável introduz código malicioso ou falha explorável no bundle | Média | Alto: comprometimento da experiência executada no navegador | Manter lockfile revisado, executar verificação automatizada de dependências no CI, atualizar correções e documentar exceções antes da publicação. |
| Produto | Público prioritário, problema principal e critérios de sucesso não definidos | Alta | Alto: equipe otimiza para personas diferentes sem saber qual necessidade priorizar | Validar personas, ordenar tarefas da primeira versão e aprovar métricas de sucesso antes de transformar hipóteses em critérios de aceite. |
| Produto | Escopo de plataforma e funcionalidades adicionais (PWA, nativo, favoritos, histórico ou alertas) continua indefinido | Média | Alto: mudança tardia pode exigir persistência, permissões, notificações ou outra arquitetura | Confirmar que a primeira versão é um site responsivo e registrar explicitamente o que fica fora do escopo; reavaliar arquitetura se o produto exigir instalação ou recursos nativos. |
| Produto | Dados apresentados não bastam para os objetivos das personas ou são interpretados incorretamente | Média | Alto: baixa confiança e decisões inadequadas, especialmente ao planejar uma viagem ou atividade ao ar livre | Validar campos, granularidade e fuso horário com usuários; informar fonte e atualização; testar se a pessoa consegue interpretar as condições e limitações da previsão. |
| Produto | Consultas de cidade são enviadas a um provedor externo sem expectativa ou transparência para o usuário | Média | Médio: surpresa sobre privacidade e perda de confiança | Informar no produto que a busca é encaminhada ao Open-Meteo; não solicitar geolocalização sem decisão e consentimento; não armazenar consultas sem finalidade, prazo e aprovação definidos. |

## Perguntas em Aberto (Open Questions)

### Produto e escopo

1. **Quem são os usuários prioritários e qual decisão eles precisam tomar com o app?** Impacto: sem personas e objetivo prioritário, não é possível ordenar funcionalidades ou avaliar se a experiência resolve o problema.
2. **Como será medido o sucesso do produto?** Impacto: sem métricas, como conclusão de busca ou retorno de usuários, não há critério objetivo para avaliar o lançamento.
3. **O produto é um site responsivo, um app web instalável (PWA) ou também exige aplicativos nativos?** Impacto: muda arquitetura, distribuição, permissões e esforço de desenvolvimento.
4. **Favoritos, histórico de consultas, alertas meteorológicos ou compartilhamento fazem parte do escopo?** Impacto: incluir essas capacidades afeta persistência, notificações, interface e prazo; excluí-las define limites claros para a primeira versão.

### Busca e localização

5. **A busca aceita nomes parciais, acentos, nomes alternativos e localidades além de cidades? Deve sugerir resultados enquanto a pessoa digita?** Impacto: define o comportamento da busca, a necessidade de sugestões e a qualidade percebida para diferentes formas de digitar.
6. **Quantos resultados de busca devem ser apresentados e quais dados os distinguem, como estado, região ou país?** Impacto: sem desambiguação, o usuário pode consultar a previsão de uma cidade homônima incorreta.
7. **O que deve acontecer quando não houver correspondência ou a busca falhar?** Impacto: sem comportamento definido, a pessoa pode ficar sem orientação para corrigir a consulta ou tentar novamente.
8. **A localização do dispositivo deve ser solicitada automaticamente, oferecida como opção ou não utilizada?** Impacto: afeta o fluxo inicial, permissões, privacidade e comportamento quando o usuário nega acesso.
9. **Quais países e regiões precisam ter cobertura de busca e previsão?** Impacto: a cobertura varia por provedor e pode deixar usuários sem resultados ou com dados incompletos.

### Dados meteorológicos e previsão

10. **Qual provedor fornecerá geocodificação e dados meteorológicos, e quais são os limites de custo, licença, cota e credenciais?** Impacto: define cobertura, confiabilidade, viabilidade de operação e possíveis restrições de uso.
11. **Quais informações compõem o “clima atual”, por exemplo temperatura, sensação térmica, condição, umidade, vento e precipitação?** Impacto: determina conteúdo da interface, dados necessários e esforço de integração.
12. **Os cinco dias incluem hoje ou representam os cinco dias completos seguintes?** Impacto: altera o intervalo exibido e pode gerar expectativas diferentes sobre a quantidade de dias futuros.
13. **A previsão será diária, horária ou ambas? Quais valores e condições devem ser exibidos em cada período?** Impacto: define densidade da interface, volume de dados e complexidade de apresentação.
14. **Em qual fuso horário e formato devem ser apresentados horários e datas: o da cidade consultada ou o do dispositivo?** Impacto: datas ou horários incorretos podem induzir decisões erradas, especialmente para viagens.
15. **Com que frequência os dados devem ser atualizados e como a interface informa o horário da última atualização?** Impacto: sem uma regra de atualização, os dados podem parecer atuais mesmo quando estão desatualizados, ou gerar consultas excessivas.
16. **Como o produto deve indicar dados ausentes, baixa confiança ou diferenças de cobertura entre localidades?** Impacto: sem tratamento explícito, a interface pode omitir informação ou transmitir falsa precisão.

### Unidades e apresentação

17. **Qual unidade é selecionada por padrão e a preferência deve persistir durante a sessão, entre visitas ou por usuário?** Impacto: afeta a primeira visualização, armazenamento e consistência entre dispositivos.
18. **A alternância Celsius/Fahrenheit se aplica a todas as temperaturas apresentadas? Como devem funcionar arredondamento e conversão?** Impacto: regras inconsistentes podem exibir valores contraditórios ou enganosos.
19. **Quais unidades serão usadas para vento, precipitação e pressão, e devem ser localizadas junto com idioma e região?** Impacto: evita combinações de unidades inesperadas e define regras de formatação regional.

### Plataforma, qualidade e operação

20. **Quais navegadores, larguras de tela e orientações devem ser suportados?** Impacto: transforma “usar em dispositivos móveis” em uma matriz concreta de compatibilidade e testes.
21. **Quais metas de desempenho são aceitáveis para abertura, busca e carregamento da previsão, e em quais condições de rede?** Impacto: sem limites mensuráveis, lentidão não pode ser identificada nem priorizada objetivamente.
22. **Qual padrão de acessibilidade deve ser atendido e quais recursos são indispensáveis, como teclado, leitor de tela e contraste?** Impacto: decisões tardias podem exigir retrabalho e excluir pessoas dos fluxos principais.
23. **Qual disponibilidade é esperada e o que deve ocorrer diante de falhas do provedor, timeout ou limite de requisições?** Impacto: define monitoramento, mensagens, retentativas e expectativas de continuidade.
24. **O app precisa funcionar sem conexão ou exibir dados em cache? Por quanto tempo os dados em cache podem ser considerados úteis?** Impacto: afeta armazenamento, atualização e risco de apresentar previsão desatualizada como atual.
25. **Quais idiomas e convenções regionais devem ser suportados para textos, datas, horários e números?** Impacto: afeta conteúdo, formatação e seleção de dados localizados.
26. **Quais dados pessoais serão coletados ou armazenados, incluindo localização, consultas e métricas de uso, e por quanto tempo?** Impacto: influencia consentimento, segurança, privacidade e obrigações legais.

## Decisões

1. **Fonte de dados: Open-Meteo, sem API key.** Justificativa: atende à necessidade de dados meteorológicos e geocodificação sem exigir configuração de chave para o app. **Resolve:** a escolha do provedor e a necessidade de credencial na pergunta 10. **Ainda precisa ser validado:** cobertura por região, limites de uso e condições de licença das APIs.
2. **“Cinco dias” = hoje + os quatro dias seguintes.** Justificativa: fixa um intervalo previsível para a previsão. **Resolve:** a interpretação do período na pergunta 12. **Ainda precisa ser definido:** granularidade diária ou horária e informações por período, na pergunta 13.
3. **Unidade padrão: Celsius.** Justificativa: estabelece uma apresentação consistente na primeira consulta. **Resolve:** a escolha da unidade inicial na pergunta 17. **Ainda precisa ser definido:** se a preferência persiste entre visitas e regras de arredondamento/conversão, nas perguntas 17 e 18.
4. **Sem autenticação e sem persistência de servidor.** Justificativa: mantém a primeira versão simples e sem contas ou dados de usuário armazenados no servidor. **Resolve:** a necessidade de login e de recursos dependentes de conta na pergunta 4; esclarece parcialmente a pergunta 26 quanto à persistência no servidor. **Ainda precisa ser definido:** eventual armazenamento local, telemetria e retenção de dados técnicos.
5. **Idioma da interface: pt-BR.** Justificativa: define um idioma inicial para a experiência do produto. **Resolve:** a escolha do idioma da interface na pergunta 25. **Ainda precisa ser definido:** o tratamento de formatos regionais e a localização dos dados fornecidos pela API.

## Suposições (Assumptions)

- A aplicação será acessada pela web em navegadores de dispositivos móveis e desktop; o briefing não pede um aplicativo nativo.
- O usuário terá conexão com a internet para consultar dados meteorológicos atualizados.
- As buscas serão iniciadas pelo nome de uma cidade; não se presume geolocalização automática.
- A alternância entre Celsius e Fahrenheit se aplica às temperaturas apresentadas; outras unidades meteorológicas ainda precisam ser definidas.
- Autenticação, histórico, favoritos e persistência de preferências não foram solicitados e não fazem parte do escopo confirmado.
- Os requisitos não-funcionais marcados como “a validar” são recomendações iniciais, não critérios aprovados pelo solicitante.