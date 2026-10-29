# Backlog de Tarefas — Weather App

Tarefas numeradas na ordem de execução e agrupadas por entrega: tipos → funções puras → services → hook → componentes → integração → testes → hardening. Dependências explícitas devem estar concluídas antes do início da tarefa.

## Entrega 1 — Tipos

### T-01 — Definir os tipos do domínio
- **Tipo:** Data
- **Descrição:** Criar contratos TypeScript compartilhados conforme o plano.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `AsyncState` e `RequestErrorKind` compilam em TypeScript strict; temperaturas canônicas são Celsius e dados ausentes usam `null`.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`

## Entrega 2 — Funções puras

### T-02 — Implementar conversão de temperatura
- **Tipo:** Data
- **Descrição:** Converter a partir do valor canônico Celsius, com uma casa decimal e empate para longe de zero.
- **Critérios de aceite:** `0 °C` resulta em `32,0 °F`; `-40 °C` resulta em `-40,0 °F`; `null` permanece indisponível e conversões repetidas não usam valor arredondado.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-03 — Implementar formatação de datas por fuso
- **Tipo:** Data
- **Descrição:** Formatar data e horário com locale pt-BR e fuso IANA recebido da cidade.
- **Critérios de aceite:** data ISO e fuso fixos produzem `dd/MM/yyyy` local, sem depender do fuso do dispositivo.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/dateFormatting.ts`

### T-04 — Implementar mapeamento de códigos WMO
- **Tipo:** Data
- **Descrição:** Mapear códigos meteorológicos WMO para rótulos pt-BR.
- **Critérios de aceite:** cada código suportado retorna o rótulo definido; código nulo ou desconhecido retorna condição indisponível sem exceção.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`

## Entrega 3 — Services

### T-05 — Implementar geocodificação
- **Tipo:** Data
- **Descrição:** Criar `searchCities` com trim, limite de cinco resultados, timeout e normalização para `City`.
- **Critérios de aceite:** consulta vazia não chama a API; request usa URL/parâmetros do plano; zero resultados retorna lista vazia; região/país ausentes viram `null`; coordenadas/fuso inválidos não geram cidade selecionável.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/openMeteo.ts`

### T-06 — Implementar consulta de clima atual
- **Tipo:** Data
- **Descrição:** Criar request `current` e normalizar seus campos para `CurrentWeather` em unidades canônicas.
- **Critérios de aceite:** parâmetros e campos correspondem ao plano; campos ausentes viram `null`; resposta inválida e valores não finitos são rejeitados.
- **Dependências:** T-01, T-04, T-05
- **Arquivos prováveis:** `src/services/openMeteo.ts`

### T-07 — Implementar consulta de previsão diária
- **Tipo:** Data
- **Descrição:** Criar request `daily` para cinco dias locais e normalizar os arrays para `ForecastDay[]`.
- **Critérios de aceite:** arrays são alinhados por índice; datas locais seguem o fuso da cidade; ausência de campo/dia vira `null`; resposta inválida é rejeitada.
- **Dependências:** T-01, T-03, T-04, T-06
- **Arquivos prováveis:** `src/services/openMeteo.ts`

## Entrega 4 — Hook

### T-08 — Implementar o hook `useWeather`
- **Tipo:** Data
- **Descrição:** Orquestrar busca, seleção, unidade e estados assíncronos independentes.
- **Critérios de aceite:** expõe `idle`, `loading`, `success`, `empty` e `error`; mantém current/forecast independentes; retry afeta somente o recurso solicitado; cancelamento obsoleto não produz erro visível.
- **Dependências:** T-01, T-05, T-06, T-07
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

## Entrega 5 — Componentes

### T-09 — Criar estado de carregamento
- **Tipo:** UI
- **Descrição:** Criar o componente acessível de loading.
- **Critérios de aceite:** componente expõe role/status acessível e o texto de carregamento pode ser encontrado por query semântica; animação não é o único indicador.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`

### T-10 — Criar estado vazio
- **Tipo:** UI
- **Descrição:** Criar o componente vazio de geocoding sem resultados.
- **Critérios de aceite:** exibe “Nenhuma cidade encontrada” e oferece callback para editar a busca; não usa role ou mensagem de erro.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/EmptyState.tsx`

### T-11 — Criar estado de erro
- **Tipo:** UI
- **Descrição:** Criar apresentação de erro recuperável com callback opcional de retry.
- **Critérios de aceite:** mensagem é pt-BR; botão “Tentar novamente” é renderizado somente quando recebe callback e é operável por teclado.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/ErrorState.tsx`

### T-12 — Criar formulário de busca
- **Tipo:** UI
- **Descrição:** Criar campo, envio, validação local e aviso de privacidade.
- **Critérios de aceite:** campo tem label acessível; entrada vazia não invoca busca; antes do envio é visível o aviso de que a consulta será encaminhada ao Open-Meteo.
- **Dependências:** T-08, T-09, T-11
- **Arquivos prováveis:** `src/components/SearchForm.tsx`

### T-13 — Criar lista de cidades
- **Tipo:** UI
- **Descrição:** Apresentar até cinco resultados e permitir seleção explícita, distinguindo homônimos.
- **Critérios de aceite:** cada resultado mostra nome e campos geográficos disponíveis; coordenadas distinguem homônimos quando necessário; todos os resultados são selecionáveis por teclado e ponteiro.
- **Dependências:** T-01, T-08, T-10
- **Arquivos prováveis:** `src/components/CityResults.tsx`

### T-14 — Criar apresentação de clima atual
- **Tipo:** UI
- **Descrição:** Renderizar campos atuais, horário local e estados da seção.
- **Critérios de aceite:** mostra temperatura, sensação térmica, condição pt-BR, umidade, vento e horário; cada campo `null` aparece como “Indisponível”.
- **Dependências:** T-01, T-04, T-08, T-09, T-11
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`

### T-15 — Criar apresentação da previsão
- **Tipo:** UI
- **Descrição:** Renderizar as cinco datas locais, condições e valores diários.
- **Critérios de aceite:** mostra exatamente hoje e os quatro dias seguintes em ordem; temperatura segue `Unit`; dia ausente aparece como “Previsão indisponível” e campo ausente como “Indisponível”.
- **Dependências:** T-01, T-02, T-03, T-04, T-08, T-09, T-11
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`

### T-16 — Criar controle de unidade
- **Tipo:** UI
- **Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit.
- **Critérios de aceite:** seleção é operável por teclado; unidade começa em Celsius; atualizar a unidade atualiza todas as temperaturas sem chamar services.
- **Dependências:** T-02, T-08
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`

## Entrega 6 — Integração

### T-17 — Criar bootstrap React
- **Tipo:** UI
- **Descrição:** Montar a entrada React e o shell mínimo de `App` para iniciar a aplicação.
- **Critérios de aceite:** Vite monta a aplicação em `#root`; `pnpm build` termina sem erro.
- **Dependências:** T-01, T-09–T-16
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`

### T-18 — Aplicar tema global Tailwind
- **Tipo:** UI
- **Descrição:** Importar estilos globais e aplicar o tema dark glassmorphism configurado.
- **Critérios de aceite:** build compila classes Tailwind; estilo calculado do root usa as cores/fontes do tema definido, sem redefinir tokens em paralelo.
- **Dependências:** T-17
- **Arquivos prováveis:** `src/styles/index.css`, `src/main.tsx`

### T-19 — Compor a tela no `App`
- **Tipo:** UI
- **Descrição:** Conectar hook e componentes, mantendo rede fora da apresentação.
- **Critérios de aceite:** com respostas mockadas, busca e seleção renderizam current e cinco datas; falha de uma seção mantém a outra visível; componentes não chamam `fetch`; em 320 CSS px, `scrollWidth <= clientWidth` e controles essenciais permanecem visíveis.
- **Dependências:** T-08–T-18
- **Arquivos prováveis:** `src/App.tsx`

## Entrega 7 — Testes

### T-20 — Preparar setup do Vitest
- **Tipo:** Infra
- **Descrição:** Configurar o setup compartilhado de testes e uma verificação mínima do ambiente jsdom.
- **Critérios de aceite:** `tests/setup.ts` é carregado por `vite.config.ts`; o teste de fumaça executa `pnpm test` e reconhece `jest-dom`.
- **Dependências:** T-19
- **Arquivos prováveis:** `tests/setup.ts`, `tests/unit/setup.test.ts`

### T-21 — Testar conversão de temperatura
- **Tipo:** Test
- **Descrição:** Cobrir conversão, precisão, arredondamento e valores ausentes.
- **Critérios de aceite:** testes afirmam `0 °C = 32,0 °F`, `-40 °C = -40,0 °F`, `null` indisponível e empates arredondados conforme a regra; `pnpm test` passa.
- **Dependências:** T-02, T-20
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`

### T-22 — Testar formatação de datas
- **Tipo:** Test
- **Descrição:** Verificar formatação pt-BR com fusos IANA diferentes do ambiente de teste.
- **Critérios de aceite:** fixtures fixas confirmam data/horário locais corretos no formato `dd/MM/yyyy`, independentemente do fuso do runner.
- **Dependências:** T-03, T-20
- **Arquivos prováveis:** `tests/unit/dateFormatting.test.ts`

### T-23 — Testar códigos WMO
- **Tipo:** Test
- **Descrição:** Cobrir rótulos mapeados e fallback para código desconhecido.
- **Critérios de aceite:** códigos conhecidos e desconhecidos produzem o resultado esperado sem lançar erro.
- **Dependências:** T-04, T-20
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`

### T-24 — Testar geocodificação
- **Tipo:** Test
- **Descrição:** Testar parâmetros e normalização do endpoint de geocoding com `fetch` mockado.
- **Critérios de aceite:** cobre trim, máximo de cinco resultados, lista vazia, campos opcionais ausentes, coordenadas/fuso ausentes e timeout; nenhum caso acessa a rede real.
- **Dependências:** T-05, T-20
- **Arquivos prováveis:** `tests/unit/geocoding.test.ts`

### T-25 — Testar clima atual
- **Tipo:** Test
- **Descrição:** Testar request e mapeamento de `current` com fixtures e `fetch` mockado.
- **Critérios de aceite:** mock de `fetch` verifica parâmetros e unidades; testes cobrem campos nulos, resposta inválida, HTTP não-2xx, desconexão e timeout; nenhum caso acessa a rede real.
- **Dependências:** T-06, T-20
- **Arquivos prováveis:** `tests/unit/currentWeather.test.ts`

### T-26 — Testar previsão diária
- **Tipo:** Test
- **Descrição:** Testar request e mapeamento dos arrays `daily` com fixtures e `fetch` mockado.
- **Critérios de aceite:** mock de `fetch` verifica parâmetros; testes cobrem cinco dias, alinhamento por índice, dados parciais, arrays inconsistentes, erro HTTP e timeout; nenhum caso acessa a rede real.
- **Dependências:** T-07, T-20
- **Arquivos prováveis:** `tests/unit/dailyForecast.test.ts`

### T-27 — Testar o hook `useWeather`
- **Tipo:** Test
- **Descrição:** Cobrir transições e coordenação do hook com serviços mockados.
- **Critérios de aceite:** verifica sucesso, vazio, falha, retry, falha parcial e cancelamento de resposta obsoleta; `pnpm test` passa.
- **Dependências:** T-08, T-20
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`

### T-28 — Testar o formulário de busca
- **Tipo:** Test
- **Descrição:** Verificar validação e aviso de privacidade no formulário.
- **Critérios de aceite:** Testing Library confirma label, bloqueio de entrada vazia e aviso visível antes do envio; busca válida aciona callback uma vez.
- **Dependências:** T-12, T-20
- **Arquivos prováveis:** `tests/components/SearchForm.test.tsx`

### T-29 — Testar lista e seleção de cidades
- **Tipo:** Test
- **Descrição:** Verificar resultados, homônimos e seleção acessível.
- **Critérios de aceite:** testes confirmam limite de cinco, dados de distinção, seleção e navegação por teclado; conteúdo externo é renderizado como texto, nunca interpretado como HTML.
- **Dependências:** T-13, T-20
- **Arquivos prováveis:** `tests/components/CityResults.test.tsx`

### T-30 — Testar componentes de estados
- **Tipo:** Test
- **Descrição:** Cobrir loading, vazio e erro em componentes isolados.
- **Critérios de aceite:** loading expõe `role="status"`; empty exibe “Nenhuma cidade encontrada” sem `role="alert"`; error expõe `role="alert"`, botão “Tentar novamente” e aciona o callback uma vez.
- **Dependências:** T-09–T-11, T-20
- **Arquivos prováveis:** `tests/components/AsyncStates.test.tsx`

### T-31 — Testar apresentação do clima atual
- **Tipo:** Test
- **Descrição:** Verificar campos, unidades e estado parcial do componente current.
- **Critérios de aceite:** teste cobre valores presentes e `null`, labels/unidades e seção atual em erro sem remover a previsão.
- **Dependências:** T-14, T-20
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`

### T-32 — Testar apresentação da previsão
- **Tipo:** Test
- **Descrição:** Verificar cinco dias, formato local e campos ausentes.
- **Critérios de aceite:** teste confirma ordem/datas, mínima/máxima, condição, precipitação, vento e placeholders de dia/campo ausente.
- **Dependências:** T-15, T-20
- **Arquivos prováveis:** `tests/components/DailyForecast.test.tsx`

### T-33 — Testar controle de unidade
- **Tipo:** Test
- **Descrição:** Verificar interação e atualização de temperatura no componente toggle.
- **Critérios de aceite:** teclado alterna unidade; todos os valores mudam; nenhum service é chamado; recarregar inicia em Celsius.
- **Dependências:** T-16, T-20
- **Arquivos prováveis:** `tests/components/TemperatureUnitToggle.test.tsx`

### T-34 — Testar fluxo principal com Playwright
- **Tipo:** Test
- **Descrição:** Cobrir busca, seleção, clima, previsão, unidade e nova busca com endpoints interceptados.
- **Critérios de aceite:** fluxo determinístico percorre enviar busca → selecionar cidade → exibir clima e cinco dias → alternar °C/°F → buscar outra cidade; casos cobrem lista vazia, timeout, retry, resposta parcial e reload; em viewports mobile 320 × 640 (retrato) e 640 × 320 CSS px (paisagem), `scrollWidth <= clientWidth` e controles essenciais permanecem visíveis; nenhum teste chama Open-Meteo ao vivo.
- **Dependências:** T-19, T-24–T-33
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`

## Entrega 8 — Hardening

### T-35 — Instalar dependências de axe
- **Tipo:** Infra
- **Descrição:** Adicionar a integração axe recomendada ao ambiente de desenvolvimento.
- **Critérios de aceite:** pacote axe para Playwright está registrado como devDependency e o lockfile é atualizado por pnpm.
- **Dependências:** T-20
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`

### T-36 — Testar acessibilidade automatizada
- **Tipo:** Test
- **Descrição:** Rodar axe nos fluxos E2E principais e documentar exceções justificadas.
- **Critérios de aceite:** busca, seleção, dados e toggle não têm violações axe não justificadas; controles essenciais são operáveis por teclado; falha de axe falha o teste.
- **Dependências:** T-34, T-35
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`

### T-37 — Configurar projetos Playwright por navegador
- **Tipo:** Infra
- **Descrição:** Declarar os projetos desktop e mobile suportados na configuração Playwright.
- **Critérios de aceite:** configuração inclui Chromium, Firefox e WebKit, mais projetos mobile Android/Chrome e iOS/Safari em orientação retrato e paisagem.
- **Dependências:** T-34
- **Arquivos prováveis:** `playwright.config.ts`

### T-38 — Instalar browsers E2E no CI
- **Tipo:** Infra
- **Descrição:** Alinhar a instalação de browsers do CI aos projetos configurados no Playwright.
- **Critérios de aceite:** workflow instala todos os engines exigidos pelos projetos e `pnpm test:e2e` não falha por browser ausente.
- **Dependências:** T-37
- **Arquivos prováveis:** `.github/workflows/ci.yml`

### T-39 — Documentar matriz de suporte de navegadores
- **Tipo:** Infra
- **Descrição:** Registrar navegadores e versões atuais/anterior requeridos pela spec e o smoke test de release para cada um.
- **Critérios de aceite:** matriz lista Chrome, Edge, Firefox e Safari para desktop, Chrome Android e Safari iOS, versões cobertas, orientação e evidência da última validação.
- **Dependências:** T-37
- **Arquivos prováveis:** `docs/browser-support-matrix.md`

### T-40 — Bloquear CI por vulnerabilidades de dependências
- **Tipo:** Infra
- **Descrição:** Executar auditoria pnpm do lockfile no workflow de CI.
- **Critérios de aceite:** job roda `pnpm audit --audit-level high` e falha diante de vulnerabilidade high/critical; exceção exige aprovação documentada e prazo de revisão.
- **Dependências:** T-38
- **Arquivos prováveis:** `.github/workflows/ci.yml`

### T-41 — Verificar o orçamento de desempenho
- **Tipo:** Test
- **Descrição:** Aferir LCP e tempo de apresentação conforme RNF4.
- **Critérios de aceite:** cinco execuções usam viewport 360 × 800 CSS px, 10/1 Mbps e 100 ms; pelo menos quatro têm LCP ≤ 2,5 s; com resposta simulada em até 500 ms, resultados aparecem em até 1 s após a resposta.
- **Dependências:** T-34, T-37
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`

### T-42 — Registrar gates de publicação
- **Tipo:** Infra
- **Descrição:** Documentar verificações de segurança e operação que bloqueiam a publicação.
- **Critérios de aceite:** checklist contém evidência para cobertura, licença, atribuição, CORS e limites Open-Meteo; registra como HTTPS/CSP são servidos no hosting; qualquer item sem evidência fica bloqueador.
- **Dependências:** T-38, T-39, T-40, T-41
- **Arquivos prováveis:** `docs/release-checklist.md`

## Prioridade e Tamanho

- **P0:** obrigatório para completar e validar o fluxo principal da primeira versão.
- **P1:** obrigatório para qualidade de release e atendimento dos requisitos não funcionais.
- **P2:** melhoria pós-MVP, não bloqueadora para os requisitos atuais. Não há tarefas P2 neste escopo; os requisitos da spec não foram rebaixados.
- **P (Pequeno):** alteração localizada, normalmente um arquivo e poucas decisões.
- **M (Médio):** implementação ou teste com mais de um caso/estado, ainda com uma fronteira clara.
- **G (Grande):** integração de várias partes, maior incerteza ou validação abrangente; recomenda-se fatiar durante a execução se exceder 1–2 dias.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | P |
| T-04 | P0 | M |
| T-05 | P0 | M |
| T-06 | P0 | M |
| T-07 | P0 | M |
| T-08 | P0 | G |
| T-09 | P0 | P |
| T-10 | P0 | P |
| T-11 | P0 | P |
| T-12 | P0 | M |
| T-13 | P0 | M |
| T-14 | P0 | M |
| T-15 | P0 | M |
| T-16 | P0 | P |
| T-17 | P0 | P |
| T-18 | P0 | P |
| T-19 | P0 | G |
| T-20 | P0 | P |
| T-21 | P0 | P |
| T-22 | P0 | P |
| T-23 | P0 | P |
| T-24 | P0 | P |
| T-25 | P0 | P |
| T-26 | P0 | P |
| T-27 | P0 | M |
| T-28 | P0 | P |
| T-29 | P0 | P |
| T-30 | P0 | P |
| T-31 | P0 | P |
| T-32 | P0 | P |
| T-33 | P0 | P |
| T-34 | P0 | G |
| T-35 | P1 | P |
| T-36 | P1 | M |
| T-37 | P1 | M |
| T-38 | P1 | P |
| T-39 | P1 | P |
| T-40 | P1 | P |
| T-41 | P1 | G |
| T-42 | P1 | M |

## Sequência de Fatias Verticais

Sequência sugerida para obter feedback visível cedo; os testes de cada fatia devem acompanhar sua implementação, mesmo que a Entrega 7 agrupe os testes no backlog atual.

| Fatia | Tarefas | Resultado demonstrável |
| --- | --- | --- |
| 0. Shell | T-01, T-17, T-18 | Aplicação abre no browser com estrutura e tema, pronta para receber a primeira jornada. |
| 1. Buscar e selecionar cidade | T-05, parte de T-08, T-09–T-13, T-19, T-20, T-24, T-28–T-30 | Pessoa busca uma cidade, vê até cinco resultados, distingue homônimos e seleciona uma localidade. |
| 2. Clima atual | T-06, extensão de T-08 e T-19, T-14, T-25, T-31 | Após selecionar uma cidade, clima atual e seus estados de carregamento/erro/ausência aparecem na tela. |
| 3. Previsão de cinco dias | T-07, extensão de T-08 e T-19, T-15, T-26, T-32 | A tela acrescenta as cinco datas locais, condições e valores diários, incluindo respostas parciais. |
| 4. Unidade e comportamento completo | T-02, T-16, T-21, T-33, T-34 | Alternância °C/°F funciona sem novo request e o fluxo completo é validado em desktop/mobile. |
| 5. Hardening e release | T-35–T-42 | Acessibilidade, compatibilidade, desempenho, auditoria de dependências e gates de publicação são verificados. |

**Ajuste de dependências para habilitar as fatias:** T-08 atualmente depende de geocoding, clima atual e previsão, e T-19 compõe todas as seções de uma vez. Para entregar a Fatia 1 antes das APIs de clima, dividir T-08 e T-19 em incrementos: busca/seleção primeiro, current depois e forecast por último. Manter as mesmas responsabilidades e acrescentar os novos IDs/dependências ao backlog antes de iniciar implementação; sem esse ajuste, a sequência atual ainda entrega a UI funcional somente após todos os serviços e componentes.

## Rastreabilidade RF → Tarefas

| Requisito | Tarefas de implementação | Tarefas de teste/verificação |
| --- | --- | --- |
| RF1 — Buscar cidades | T-05, T-08, T-12, T-13, T-19 | T-24, T-28, T-29, T-34 |
| RF2 — Consultar clima atual | T-06, T-08, T-14, T-19 | T-25, T-31, T-34 |
| RF3 — Previsão diária | T-07, T-08, T-15, T-19 | T-26, T-32, T-34 |
| RF4 — Alternar unidade | T-02, T-16, T-19 | T-21, T-33, T-34 |
| RNF1 — Responsividade | T-18, T-19 | T-34, T-37 |
| RNF2 — Acessibilidade | T-09–T-16 | T-28–T-30, T-33, T-36 |
| RNF3 — Compatibilidade | T-37–T-39 | T-38, T-39 |
| RNF4 — Desempenho | — | T-41 |
| RNF5 — Resiliência | T-05–T-08, T-11, T-14–T-15 | T-24–T-27, T-30–T-34 |
| RNF6 — Segurança e privacidade | T-05–T-07, T-12, T-42 | T-24–T-25, T-28–T-29, T-42 |
| RNF7 — Segredos e dependências | T-40 | T-40, T-42 |

**Requisitos funcionais sem tarefa correspondente:** nenhum. RF1–RF4 têm tarefas de implementação e de teste listadas acima.

## Nota de alinhamento

Os defaults de produto e os gates de publicação continuam sujeitos à aprovação prevista na spec e no plano. O backlog mantém a validação de privacidade, navegadores, dependências e hosting na etapa de hardening.