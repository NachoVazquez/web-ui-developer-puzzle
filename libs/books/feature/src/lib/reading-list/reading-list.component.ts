import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  finishTheReadingItem,
  getReadingList,
  removeFromReadingList,
} from '@tmo/books/data-access';
import { trackByField } from '@tmo/shared/utils';

@Component({
  selector: 'tmo-reading-list',
  templateUrl: './reading-list.component.html',
  styleUrls: ['./reading-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingListComponent {
  trackByBookId = trackByField('bookId');
  readingList$ = this.store.select(getReadingList);

  finishedControl = new FormControl();

  constructor(private readonly store: Store) {}

  finishTheBook(item) {
    this.store.dispatch(finishTheReadingItem({ item }));
  }

  removeFromReadingList(item) {
    this.store.dispatch(removeFromReadingList({ item }));
  }
}
