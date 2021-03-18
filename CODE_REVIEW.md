# CODE REVIEW

## Architectural improvements

- We already remove most from the applications, but we could go a step further and achieve tiny applications by
  - extracting the **environments** into its own library -- [check here](https://indepth.dev/posts/1185/tiny-angular-application-projects-in-nx-workspaces)
  - extracting the **assets** into its own library -- [check here](https://indepth.dev/posts/1185/tiny-angular-application-projects-in-nx-workspaces)
  - Extract application-wide configuration to a feature-shell library (store configuration, route configuration, etc) -- [check here](https://indepth.dev/posts/1117/the-shell-library-patterns-with-nx-and-monorepo-architectures)
- Our Books grouping folder is practically representing a vertical slice in our application. Therefore, it is a good candidate to include one or more shell library to orchestrate the sub-domain configuration and act as entry points for the `feature-shell` library or other vertical slices -- [check here](https://indepth.dev/posts/1117/the-shell-library-patterns-with-nx-and-monorepo-architectures)
- Currently, our components are mixed components, meaning that we are mixing concerns and not making a division between presentational and container components.
  - Containers components should care about communicating with the store and passing the data to the presentational components. They should have minimum UI.
  - Presentational components should only care about presenting the data passed as inputs in the UI. They MUST not modify the global store or integrate with non-presentation layers.
  - Consider moving the newly extracted presentational components into separate `ui` libraries -- check [this](https://nx.dev/latest/angular/structure/library-types)
  - See more at [the MVP series](https://dev.to/this-is-angular/model-view-presenter-with-angular-533h)
- None of our libraries have tags (nx.json), and therefore, no layering restriction is enforced into our libraries. Check [here](https://nx.dev/latest/angular/structure/monorepo-tags)
- `+state` folder in books-data-access lib is already getting large. I would split it into `books` and `reading-list` subfolders to make it easier to manage
- It would be great to extract our store data-conversion and validation functionality into different modules for better, re-use and maintainability

## Code smells and problems

- All components are using the default change detection strategy provided by Angular. This is sub-optimal since they will be performing re-renders after every MicroTask, MacroTask, Http Data Request, etc. After applying the Mixed components refactor, make every presentational Component follow the OnPush change detection strategy, which will only apply a re-render to the subtree of components when an Input change (checks by value) or a DOM event is triggered.
- On some components, we are subscribing to the store (hot observable) and not unsubscribing when the Component is destroyed, causing memory leaks. Either unsubscribe at the OnDestroy method, use rxjs operators or subscribe using the async pipe. This a good refactor to do along the Mixed components refactor. For a complete unsubscribe guide [see this](https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0)
- In the Book Search component, we are using a `formatDate` function to visualize a string representation of a date in the UI. Instead of doing this, it is better to use the DatePipe that comes out of the box with Angular. This is a more declarative way of doing this and has some memoization benefits that would help reduce re-renders.
- We are not adequately using routing. We are directly using the components that should be routed, and at the same time, we are declaring a RoutingModule.forChild that it is unused. Please add a `RouterModule.forRoot()` at the root configuration module (Eg. AppModule) and lazy load the Books child routing (since it is the only one, we can add some preloading strategy to make it load with the main bundle). Additionally, replace the `tmo-total-count` component with and `<router-outlet>` at the `app.component.html`
Our `reading-list.reducer.spec` is implementing an **add to reading list** partially optimistic and, therefore, fails to show the application's real status when an error occurs.
- Many test scenarios are missing; for example, in the `books.effects.spec.ts,` we are only testing the happy paths. Let's complete the test suite.
Our `reading-list.reducer.spec` is implementing a **remove from reading list** partially optimistic and, therefore, fails to show the application's real status when an error occurs.
- None of the components that are doing an `*ngFor` are using a TrackBy function. The TrackBy function allows Angular to determine what elements were removed, added, or changed and act accordingly instead of destroying and re-creating the list every time a change is detected. See more [here](https://netbasal.com/angular-2-improve-performance-with-trackby-cc147b5104e5)
- We are calling a "join" function from the template. It can be optimized by using a custom pipe.
- Template variables of the ReadingListComponent have poor names. We should use better names to increase maintainability 
- The BookSearchComponent has multiple responsibilities. It is searching and showing the search result. We should consider splitting into multiple components.
- Some components have empty lifecycle functions like the ngOnInit; we should consider cleaning this up.
- `TotalCountComponent` could be declared within their modules to avoid importing so many Angular Material modules within `BooksFeatureModule`

## Accessibility Lighthouse

- Color contrast does not satisfy the accessibility requirements.
- The search button is an icon button without an aria-label and cannot be read appropriately by a screen reader.

## Accessibility Manual Check

- The reading-list drawer close button is an icon button without an aria-label and cannot be read appropriately by and screen reader.
- Search form is not identified with the search role, and neither the input nor button.
- The book-list is not declared as a ul element, but it is using a generic div
- The book-list focus is not directed when appearing on the screen.
- The book-list items are not identified with a proper li element but with a generic div
- Javascript default search button "Javascript" is placed with an anchor element "a" (without href) instead of a button element.
- Javascript default search button "Javascript" does not have an aria-label describing its semantic behavior.
- Book card items are not using a proper heading element for the title
- Book card items are not using alt text for the cover image
- Book card details were using a generic div element instead of a more accurate paragraph "p" element
- Book card is not using the role article, which is a good match
- Book card is not focusable, and the reader cannot get into its details
