import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Capture console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  
  await page.goto('http://localhost:5173/chess', { waitUntil: 'networkidle0' });
  
  console.log('Page loaded, taking initial screenshot...');
  
  console.log('Finding e2 square...');
  const e2Square = await page.$('[data-square="e2"]');
  if (!e2Square) {
    console.log('e2 square not found!');
    await browser.close();
    return;
  }
  
  const box = await e2Square.boundingBox();
  console.log('e2 bounding box:', box);
  
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  
  console.log('Moving mouse to e2...');
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  
  console.log('Dragging to e4...');
  const endX = startX;
  const endY = startY - (box.height * 2);
  
  await page.mouse.move(endX, endY, { steps: 10 });
  await new Promise(r => setTimeout(r, 200));
  await page.mouse.up();
  
  console.log('Drag released. Waiting 1 second...');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Done.');
  await browser.close();
})();
