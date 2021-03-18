import { Injectable } from '@nestjs/common';
import { StorageService } from '@tmo/shared/storage';
import { Book, ReadingListItem } from '@tmo/shared/models';

const KEY = '[okreads API] Reading List';

@Injectable()
export class ReadingListService {
  private readonly storage = new StorageService<ReadingListItem[]>(KEY, []);

  async getList(): Promise<ReadingListItem[]> {
    return this.storage.read();
  }

  async addBook(b: Book): Promise<void> {
    this.storage.update((list) => {
      const { id, ...rest } = b;
      list.push({
        bookId: id,
        ...rest,
      });
      return list;
    });
  }

  async removeBook(id: string): Promise<void> {
    this.storage.update((list) => {
      return list.filter((x) => x.bookId !== id);
    });
  }

  async markBookAsFinished(id: string): Promise<ReadingListItem> {
    let updateItem: ReadingListItem;
    this.storage.update((list) => {
      const foundItem = this.findItemById(list, id);
      const itemIndex = this.findIndexOfItemById(list, id);

      if (foundItem) {
        const completedItem: ReadingListItem = {
          ...foundItem,
          finished: true,
          finishedDate: new Date().toISOString(),
        };
        list.splice(itemIndex, 1, completedItem);
        updateItem = completedItem;
        return list;
      }

      return list;
    });

    return updateItem;
  }
  private findItemById = (list: ReadingListItem[], id: string) =>
    list.find((item) => item.bookId === id);

  private findIndexOfItemById = (list: ReadingListItem[], id: string) =>
    list.findIndex((item) => item.bookId === id);
}
