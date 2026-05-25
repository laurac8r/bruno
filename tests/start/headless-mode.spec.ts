import { test } from '../../playwright';
import { expect } from '@playwright/test';

async function waitForVisibility(app: any, timeout = 10000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const isVisible = await app.evaluate(({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      return win?.isVisible() ?? false;
    });
    if (isVisible) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

test.describe('Headless mode', () => {
  test('window becomes visible without HEADLESS env', async ({ launchElectronApp }) => {
    const app = await launchElectronApp({ dotEnv: { HEADLESS: '', HEADED: '1' } });
    await app.firstWindow();

    const becameVisible = await waitForVisibility(app);
    expect(becameVisible).toBe(true);
  });

  test('window should not be visible when HEADLESS env is set', async ({ launchElectronApp }) => {
    const app = await launchElectronApp({ dotEnv: { HEADLESS: '1' } });
    await app.firstWindow();

    const becameVisible = await waitForVisibility(app, 5000);
    expect(becameVisible).toBe(false);
  });
});

test.describe('macOS reopen windows dialog prevention', () => {
  test.skip(process.platform !== 'darwin', 'macOS only');

  test('sets ApplePersistenceIgnoreState when PLAYWRIGHT env is set', async ({ electronApp }) => {
    const result = await electronApp.evaluate(({ systemPreferences }) => {
      return systemPreferences.getUserDefault('ApplePersistenceIgnoreState', 'boolean');
    });

    expect(result).toBe(true);
  });
});