import { $, $$, browser, element, by, ExpectedConditions } from 'protractor';

async function addElementToList() {
  const form = await $('form');
  const input = await $('input[type="search"]');
  await input.sendKeys('javascript');
  await form.submit();

  const addToListBtn = await element(by.partialButtonText('Want to Read'));
  await addToListBtn.click();
}

async function openDrawer() {
  const readingListToggle = await $('[data-testing="toggle-reading-list"]');
  await readingListToggle.click();
}

async function removeElementFromList() {
  await openDrawer();

  const removeBtn = await $('[data-testing="remove-reading-item"]');

  await removeBtn.click();
}

async function clickUndoButtonOnSnackbar() {
  await browser.executeScript(
    'document.querySelector("simple-snack-bar > div >  button").click()'
  );
}

describe('When: I use the reading list feature', () => {
  beforeEach(async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );
  });

  it('Then: I should see my reading list', async () => {
    const readingListToggle = await $('[data-testing="toggle-reading-list"]');
    await readingListToggle.click();

    await browser.wait(
      ExpectedConditions.textToBePresentInElement(
        $('[data-testing="reading-list-container"]'),
        'My Reading List'
      )
    );
  });

  it('Then: I should undo adding a book to the reading list', async () => {
    await addElementToList();
    await clickUndoButtonOnSnackbar();

    const readingListToggle = await $('[data-testing="toggle-reading-list"]');
    readingListToggle.click();

    await browser.wait(
      ExpectedConditions.textToBePresentInElement(
        $('[data-testing="reading-list-container"]'),
        "You haven't added any books to your reading list yet."
      )
    );
  });

  it('Then: I should undo removing a book from the reading list', async () => {
    await addElementToList();
    await removeElementFromList();
    await clickUndoButtonOnSnackbar();

    await browser.wait(
      ExpectedConditions.presenceOf($('[data-testing="reading-list-item"]'))
    );
  });
});
