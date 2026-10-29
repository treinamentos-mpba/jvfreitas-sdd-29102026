import { expect, type Page, test } from '@playwright/test';

const cityResult = {
  id: 12345,
  name: 'Curitiba',
  admin1: 'Paraná',
  country: 'Brasil',
  country_code: 'BR',
  latitude: -25.43,
  longitude: -49.27,
  timezone: 'America/Sao_Paulo',
};

function forecastResponse(temperature: number) {
  return {
    timezone: 'America/Sao_Paulo',
    current: {
      time: '2026-10-29T12:00',
      temperature_2m: temperature,
      apparent_temperature: temperature,
      relative_humidity_2m: 55,
      weather_code: 0,
      wind_speed_10m: 8,
      precipitation: 0,
      pressure_msl: 1013,
    },
    daily: {
      time: ['2026-10-29', '2026-10-30', '2026-10-31', '2026-11-01', '2026-11-02'],
      weather_code: [0, 1, 2, 3, 61],
      temperature_2m_min: [temperature, 1, 2, 3, 4],
      temperature_2m_max: [10, 11, 12, 13, 14],
      precipitation_probability_max: [0, 10, 20, 30, 80],
      wind_speed_10m_max: [8, 9, 10, 11, 12],
    },
  };
}

async function mockWeatherApis(page: Page, geocodingBody: unknown, temperature = 0) {
  await page.route(
    (url) => url.hostname === 'geocoding-api.open-meteo.com' && url.pathname === '/v1/search',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(geocodingBody),
      });
    },
  );

  await page.route(
    (url) => url.hostname === 'api.open-meteo.com' && url.pathname === '/v1/forecast',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(forecastResponse(temperature)),
      });
    },
  );
}

test('busca uma cidade, mostra a previsão de cinco dias e alterna para Fahrenheit', async ({
  page,
}) => {
  await mockWeatherApis(page, { results: [cityResult] });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Curitiba' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  await expect(page.getByText('0,0 °C').first()).toBeVisible();

  await page.getByRole('button', { name: 'Fahrenheit' }).click();

  await expect(page.getByText('32,0 °F').first()).toBeVisible();
});

test('mostra estado vazio quando geocoding responde sem results', async ({ page }) => {
  await mockWeatherApis(page, {});

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Cidade sem resultado');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada' })).toBeVisible();
});

test('renderiza o clima corretamente no viewport mobile 375x812', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await mockWeatherApis(page, { results: [cityResult] }, 18.5);

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Buscar cidade' }).fill('Curitiba');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Curitiba' })).toBeVisible();
  await expect(page.getByText('18,5 °C').first()).toBeVisible();
  await expect(page.getByRole('region', { name: 'Previsão de 5 dias' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
});
