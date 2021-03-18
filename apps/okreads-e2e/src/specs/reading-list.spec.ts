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

async function closeDrawer() {
  const readingListCloseBtn = await $('[data-testing="close-reading-list"]');
  await readingListCloseBtn.click();
}

async function removeElementFromList() {
  await openDrawer();

  const removeBtn = await $('[data-testing="remove-reading-item"]');

  await removeBtn.click();
}

async function markAsFinished() {
  await openDrawer();

  const checkbox = await $('[data-testing="check-finished-reading-item"]');

  await checkbox.click();
}

describe('When: I use the reading list feature', () => {
  beforeEach(async () => {
    await browser.get('/');
    await browser.wait(
      ExpectedConditions.textToBePresentInElement($('tmo-root'), 'okreads')
    );
  });

  it('Then: I should see my reading list', async () => {
    await openDrawer();

    await browser.wait(
      ExpectedConditions.textToBePresentInElement(
        $('[data-testing="reading-list-container"]'),
        'My Reading List'
      )
    );
  });

  it('Then: I should be able to marks a read item as finished', async () => {
    await addElementToList();
    await markAsFinished();

    await browser.wait(
      ExpectedConditions.presenceOf(
        $('[data-testing="finished-reading-item-icon"]')
      )
    );

    await browser.wait(
      ExpectedConditions.presenceOf(
        $('[data-testing="finished-date-reading-item"]')
      )
    );

    await closeDrawer();

    let finishedIndicators = await $$(
      '[data-testing="finished-book-indicator"]'
    );

    expect(finishedIndicators.length).toBe(1);

    await removeElementFromList();

    await closeDrawer();

    finishedIndicators = await $$('[data-testing="finished-book-indicator"]');

    expect(finishedIndicators.length).toBe(0);

    await addElementToList();

    await openDrawer();

    expect(
      $('[data-testing="check-finished-reading-item"]').getAttribute('checked')
    ).toBeFalsy();
  });
});
