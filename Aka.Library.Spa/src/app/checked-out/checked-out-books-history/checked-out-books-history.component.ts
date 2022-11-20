
import { AfterViewInit, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { AuthService } from '../../services/auth.service';
import { MemberService } from '../../services/member.service';
import { LibrariesService } from '../../services/libraries.service';
import { BooksService } from '../../services/books.service';
import { SignedOutBookDetails } from '../../shared/signed-out-book-details';
import { slideInDownAnimation } from '../../animations';
import { SignedOutBook } from '../../shared/signed-out-book';
import { map, mergeAll } from 'rxjs/operators';
import { forkJoin, zip } from 'rxjs';
import { Router } from '@angular/router';

@Component({
    selector: 'app-checked-out-books-history',
    templateUrl: './checked-out-books-history.component.html',
    styleUrls: ['./checked-out-books-history.component.scss'],
    animations: [slideInDownAnimation]
})
export class CheckedOutBooksHistoryComponent implements OnInit, AfterViewInit {
    
    @HostBinding('@routeAnimation') routeAnimation = true;
    @HostBinding('style.display')   display = 'block';
    @HostBinding('style.position')  position = 'initial';

    @ViewChild(MatSort, { static: true }) sort: MatSort;
    @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

    public displayedColumns = ['id', 'library', 'title', 'dateCheckedOut'];
    public dataSource = new MatTableDataSource();
   
    constructor(
        private authService: AuthService,
        private memberService: MemberService,
        private libraryService: LibrariesService,
        private booksService: BooksService,
        private router: Router) {
    }

    public ngOnInit(): void {
        this.getPreviouslyCheckedOutBooks();
    }

    public ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
    }

    public applyFilter(filterValue: string): void {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    private getPreviouslyCheckedOutBooks(): void {
        this.memberService.getMemberBookHistory(this.authService.currentMember)
            .pipe(
                map((previousBooks: SignedOutBook []) => {
                    const previousBooks$ = previousBooks.map(previousBook => forkJoin([
                        this.libraryService.getLibrary(previousBook.libraryId),
                        this.booksService.getBook(previousBook.libraryId, previousBook.bookId)
                    ])
                        .pipe(
                            map(([library, book]) => ({ ...previousBook, libraryName: library.name, bookName: book.title }))
                        ));
                    return zip(...previousBooks$);
                }),
                mergeAll()
            ).subscribe((previousBookDetails: SignedOutBookDetails[]) => {
                this.dataSource.data = previousBookDetails;
            });
    }
}
