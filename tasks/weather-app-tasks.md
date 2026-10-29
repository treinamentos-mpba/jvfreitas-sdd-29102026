# Backlog de Tarefas — Weather App

Tarefas ordenadas por entrega e dependência. Os critérios devem ser verificados antes de marcar cada tarefa como concluída.

## Entrega 1 — Fundação e contratos

### T-01 — Criar bootstrap da aplicação React
- **Tipo:** UI
- **Descrição:** Criar o ponto de entrada React e a composição inicial da página, aproveitando Vite, Tailwind e o tema dark glassmorphism configurado no projeto.
- **Critérios de aceite:** `pnpm build` conclui sem erros; a aplicação monta em `#root`; os estilos Tailwind e o tema do projeto são aplicados sem criar um segundo sistema de estilos.
- **Dependências:** —
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`, `src/styles/index.css`, `index.html`

### T-02 — Definir os tipos do domínio
- **Tipo:** Data
- **Descrição:** Criar os tipos compartilhados definidos no plano, com unidades canônicas e campos opcionais representados por `null`.
- **Critérios de aceite:** `City`, `CurrentWeather`, `ForecastDay`, `WeatherData`, `Unit`, `AsyncState` e `RequestErrorKind` compilam em TypeScript strict; temperaturas do domínio são armazenadas em Celsius.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`

### T-03 — Preparar setup de testes
- **Tipo:** Infra
- **Descrição:** Criar o setup compartilhado do Vitest e confirmar a execução de um teste básico no ambiente jsdom já configurado.
- **Critérios de aceite:** o arquivo configurado em `vite.config.ts` existe; `pnpm test` executa ao menos um teste e reconhece `jest-dom` sem erro de setup.
- **Dependências:** —
- **Arquivos prováveis:** `tests/setup.ts`, `tests/unit/setup.test.ts`

## Entrega 2 — Funções puras

### T-04 — Implementar conversão e formatação de temperatura
- **Tipo:** Data
- **Descrição:** Implementar conversão Celsius/Fahrenheit a partir do valor canônico em Celsius, com uma casa decimal e empate para longe de zero.
- **Critérios de aceite:** `0 °C` resulta em `32,0 °F`; `-40 °C` resulta em `-40,0 °F`; conversões repetidas não usam o valor já arredondado; valor `null` é tratado como indisponível.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-05 — Implementar formatação de datas por fuso
- **Tipo:** Data
- **Descrição:** Implementar funções puras para formatar datas e horários no fuso IANA da cidade e no locale pt-BR.
- **Critérios de aceite:** dada uma data ISO e fuso fixos, a função retorna o formato `dd/MM/yyyy`; a mesma entrada produz a data local correta sem depender do fuso do dispositivo.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/lib/dateFormatting.ts`

### T-06 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Descrição:** Mapear os códigos WMO usados pelo serviço para rótulos pt-BR e fornecer fallback para código desconhecido.
- **Critérios de aceite:** cada código suportado retorna o rótulo definido; código desconhecido ou nulo retorna condição indisponível sem lançar exceção.
- **Dependências:** —
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`

### T-07 — Testar as funções puras
- **Tipo:** Test
- **Descrição:** Cobrir conversão, arredondamento, formatação de data/fuso e mapeamento WMO com entradas determinísticas.
- **Critérios de aceite:** testes cobrem valores positivos, negativos, nulos, empate de arredondamento, fuso diferente do dispositivo e código WMO desconhecido; `pnpm test` passa.
- **Dependências:** T-03, T-04, T-05, T-06
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`, `tests/unit/dateFormatting.test.ts`, `tests/unit/weatherCodes.test.ts`

## Entrega 3 — Integração de dados

### T-08 — Implementar geocodificação Open-Meteo
- **Tipo:** Data
- **Descrição:** Implementar `searchCities` com trim, limite de cinco resultados, timeout, validação do payload e normalização para `City`.
- **Critérios de aceite:** consulta vazia não gera request; consulta válida usa os parâmetros do plano; zero resultados retorna coleção vazia; região/país ausentes viram `null`; coordenadas e fuso ausentes tornam o resultado não selecionável.
- **Dependências:** T-02
- **Arquivos prováveis:** `src/services/openMeteo.ts`

### T-09 — Implementar serviços de clima atual e previsão
- **Tipo:** Data
- **Descrição:** Implementar requests `current` e `daily` separados, normalizando unidades, códigos WMO, horário local e os cinco dias previstos.
- **Critérios de aceite:** clima atual e forecast usam parâmetros e unidades do plano; os requests podem falhar/repetir independentemente; arrays diários são alinhados por índice; ausência de campo/dia vira `null`; payload inválido é rejeitado.
- **Dependências:** T-02, T-06, T-08
- **Arquivos prováveis:** `src/services/openMeteo.ts`

### T-10 — Testar os serviços Open-Meteo
- **Tipo:** Test
- **Descrição:** Verificar construção de requests, normalização de DTOs e caminhos de erro usando `fetch` mockado.
- **Critérios de aceite:** testes cobrem parâmetros de geocoding/current/daily, máximo de cinco cidades, zero resultados, sucesso, resposta parcial, HTTP não-2xx, JSON inválido, desconexão e timeout; nenhuma suite acessa a rede real.
- **Dependências:** T-03, T-08, T-09
- **Arquivos prováveis:** `tests/unit/openMeteo.test.ts`

## Entrega 4 — Estado e orquestração

### T-11 — Implementar o hook `useWeather`
- **Tipo:** Data
- **Descrição:** Orquestrar busca, seleção, unidade e estados independentes para geocoding, clima atual e previsão.
- **Critérios de aceite:** expõe os estados `idle`, `loading`, `success`, `empty` e `error`; mantém erro de current independente de forecast; retry reinicia somente o recurso acionado; cancelamento de request obsoleto não produz erro visível.
- **Dependências:** T-02, T-08, T-09
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

### T-12 — Testar o hook e transições de estado
- **Tipo:** Test
- **Descrição:** Testar transições do hook com serviços substituídos por mocks.
- **Critérios de aceite:** testes verificam sucesso, vazio, falha, retry, falha parcial entre current/forecast e cancelamento de resposta obsoleta; `pnpm test` passa.
- **Dependências:** T-03, T-11
- **Arquivos prováveis:** `tests/unit/useWeather.test.ts`

## Entrega 5 — Interface

### T-13 — Criar componentes de estados assíncronos
- **Tipo:** UI
- **Descrição:** Criar componentes reutilizáveis de loading, vazio e erro, com mensagem e ação apropriadas ao contexto.
- **Critérios de aceite:** loading tem indicador acessível; empty diferencia ausência de resultados de erro; error exibe mensagem pt-BR e botão “Tentar novamente” quando recebe callback.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`

### T-14 — Criar busca e seleção de cidades
- **Tipo:** UI
- **Descrição:** Criar formulário de busca e lista de até cinco localidades selecionáveis, distinguindo homônimos.
- **Critérios de aceite:** campo tem label acessível; entrada vazia é bloqueada; antes do primeiro envio é exibido aviso de que a consulta será enviada ao Open-Meteo; resultados mostram nome, região/país e coordenadas quando necessárias; a pessoa precisa selecionar uma cidade antes da consulta meteorológica.
- **Dependências:** T-02, T-11, T-13
- **Arquivos prováveis:** `src/components/SearchForm.tsx`, `src/components/CityResults.tsx`

### T-15 — Apresentar clima atual
- **Tipo:** UI
- **Descrição:** Renderizar os campos atuais, horário local e estado isolado da seção.
- **Critérios de aceite:** exibe temperatura, sensação térmica, condição pt-BR, umidade, vento e horário; cada campo nulo aparece como “Indisponível”; erro e retry não removem a previsão carregada.
- **Dependências:** T-02, T-04, T-06, T-11, T-13
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`

### T-16 — Apresentar previsão de cinco dias
- **Tipo:** UI
- **Descrição:** Renderizar as cinco datas locais, temperatura mínima/máxima, condição, precipitação e vento máximo.
- **Critérios de aceite:** mostra exatamente hoje e os quatro dias seguintes em ordem; temperatura segue `Unit`; dia ausente aparece como “Previsão indisponível”; campos nulos aparecem como “Indisponível”.
- **Dependências:** T-02, T-04, T-05, T-06, T-11, T-13
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`

### T-17 — Criar controle de unidade
- **Tipo:** UI
- **Descrição:** Criar controle acessível para alternar Celsius/Fahrenheit, atualizando apenas o estado de apresentação.
- **Critérios de aceite:** seleção é operável por teclado e nomeada semanticamente; mudar unidade atualiza todas as temperaturas sem chamar serviços; unidade começa em Celsius e não persiste após reload.
- **Dependências:** T-04, T-11
- **Arquivos prováveis:** `src/components/TemperatureUnitToggle.tsx`

### T-18 — Compor a tela no `App`
- **Tipo:** UI
- **Descrição:** Conectar hook, busca, resultados, current, forecast, unidade e layout responsivo.
- **Critérios de aceite:** fluxo completo funciona sem componentes chamarem `fetch`; se uma seção falhar, a outra permanece visível; largura de 320 CSS px não corta controles nem gera rolagem horizontal.
- **Dependências:** T-01, T-11, T-13, T-14, T-15, T-16, T-17
- **Arquivos prováveis:** `src/App.tsx`, `src/styles/index.css`

### T-19 — Testar busca e componentes de estado
- **Tipo:** Test
- **Descrição:** Testar busca, seleção, validação de entrada e apresentação de loading/empty/error.
- **Critérios de aceite:** Testing Library verifica zero request para entrada vazia, aviso de privacidade visível antes do envio, mensagem de sem resultados, seleção de homônimos, loading, erro e callback de retry usando roles/labels acessíveis.
- **Dependências:** T-03, T-13, T-14
- **Arquivos prováveis:** `tests/components/SearchForm.test.tsx`, `tests/components/CityResults.test.tsx`, `tests/components/AsyncStates.test.tsx`

### T-20 — Testar apresentação meteorológica e unidade
- **Tipo:** Test
- **Descrição:** Testar conteúdo de current/forecast, campos ausentes e atualização de todas as temperaturas pela unidade.
- **Critérios de aceite:** testes confirmam labels/unidades, cinco dias, placeholders para dados parciais, conversão e ausência de chamadas a services ao alternar unidade.
- **Dependências:** T-03, T-15, T-16, T-17
- **Arquivos prováveis:** `tests/components/CurrentWeather.test.tsx`, `tests/components/DailyForecast.test.tsx`, `tests/components/TemperatureUnitToggle.test.tsx`

## Entrega 6 — E2E e hardening

### T-21 — Cobrir fluxo principal com Playwright
- **Tipo:** Test
- **Descrição:** Testar a jornada de busca, seleção, consulta e troca de unidade com APIs interceptadas.
- **Critérios de aceite:** fluxo completo usa fixtures determinísticas; cenários cobrem geocoding sem resultados, erro/timeout, retry, resposta parcial, troca de cidade e reload; nenhum teste depende de Open-Meteo ao vivo.
- **Dependências:** T-18
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`

### T-22 — Automatizar verificações de acessibilidade
- **Tipo:** Test
- **Descrição:** Integrar axe aos fluxos E2E principais e completar verificações de teclado e foco.
- **Critérios de aceite:** os fluxos de busca, seleção, current/forecast e unidade não apresentam violações axe não justificadas; controles essenciais são alcançáveis e operáveis por teclado; exceções ficam documentadas.
- **Dependências:** T-18, T-21
- **Arquivos prováveis:** `package.json`, `pnpm-lock.yaml`, `tests/e2e/accessibility.spec.ts`

### T-23 — Alinhar matriz Playwright e browsers instalados no CI
- **Tipo:** Infra
- **Descrição:** Fazer os projetos desktop/mobile do Playwright corresponderem aos browsers instalados pelo workflow.
- **Critérios de aceite:** matriz documenta desktop Chrome/Chromium, Edge, Firefox e Safari/WebKit, além de Chrome/Android e Safari/iOS em retrato e paisagem; CI instala e executa os engines configurados; o checklist de release registra smoke tests na versão atual e anterior exigidas por RNF3; nenhum projeto falha por browser ausente.
- **Dependências:** T-21
- **Arquivos prováveis:** `playwright.config.ts`, `.github/workflows/ci.yml`, `docs/browser-support-matrix.md`

### T-24 — Bloquear CI por vulnerabilidades altas ou críticas
- **Tipo:** Infra
- **Descrição:** Adicionar verificação automatizada de dependências ao pipeline conforme RNF7.
- **Critérios de aceite:** CI executa auditoria do lockfile e falha diante de vulnerabilidade high/critical; exceção aprovada deve ter registro e prazo de revisão.
- **Dependências:** T-23
- **Arquivos prováveis:** `.github/workflows/ci.yml`, `package.json`, `pnpm-lock.yaml`

### T-25 — Verificar o orçamento de desempenho
- **Tipo:** Test
- **Descrição:** Aferir LCP e tempo de apresentação dos resultados usando o perfil de rede definido em RNF4.
- **Critérios de aceite:** em cinco execuções com viewport 360 × 800 CSS px, 10/1 Mbps e 100 ms, pelo menos quatro registram LCP ≤ 2,5 s; com resposta simulada em até 500 ms, os resultados aparecem em até 1 s após a resposta.
- **Dependências:** T-18, T-21
- **Arquivos prováveis:** `tests/e2e/performance.spec.ts`, `docs/performance-validation.md`

### T-26 — Registrar gates de publicação
- **Tipo:** Infra
- **Descrição:** Documentar a validação operacional do Open-Meteo e do hosting antes do deploy.
- **Critérios de aceite:** checklist exige aprovação de cobertura/regiões, licença, atribuição, CORS e limites; HTTPS/CSP são verificados no site publicado; release não é marcado como pronto sem evidências do gate.
- **Dependências:** T-23, T-24
- **Arquivos prováveis:** `docs/release-checklist.md`, `.github/workflows/pages.yml`

## Rastreabilidade RF → Tarefas

| Requisito | Tarefas |
| --- | --- |
| RF1 — Buscar cidades | T-08, T-14, T-19, T-21 |
| RF2 — Consultar clima atual | T-09, T-15, T-20, T-21 |
| RF3 — Previsão diária | T-09, T-16, T-20, T-21 |
| RF4 — Alternar unidade | T-04, T-17, T-20, T-21 |
| RNF1 — Responsividade | T-18, T-21, T-23 |
| RNF2 — Acessibilidade | T-14, T-19, T-22 |
| RNF3 — Compatibilidade | T-23 |
| RNF4 — Desempenho | T-25 |
| RNF5 — Resiliência | T-08, T-09, T-11, T-19, T-21 |
| RNF6 — Segurança e privacidade | T-14, T-19, T-26 |
| RNF7 — Segredos e dependências | T-24, T-26 |

## Nota de alinhamento

A spec exige aviso de privacidade antes da primeira busca (RNF6), matriz de navegadores (RNF3) e bloqueio por vulnerabilidades altas/críticas (RNF7). Esses itens não estão detalhados no plano técnico. As tarefas T-14, T-23 e T-24 os incluem para manter cobertura da spec; recomenda-se atualizar o plano antes da implementação dessas tarefas.