import { environment } from '../../environments/environment';
import { LibraryBook } from '../shared/library-book';
import { Book } from '../shared/book';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SignedOutBook } from '../shared/signed-out-book';
import { GoogleBooksMetadata } from '../shared/google-books-metadata';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs/internal/observable/throwError';
import { of } from 'rxjs/internal/observable/of';
import { map } from 'rxjs/operators';

@Injectable()
export class BooksService {

  apiUrl: string;
  googleBooksAPIKey: string;

  constructor(private http: HttpClient) {
    this.apiUrl = `${environment.apiUrl}${environment.apiPath}/libraries/`;
    this.googleBooksAPIKey = 'AIzaSyCCN_lQcnEQ51ohoDBroFvfwN8wnJi9iPY';
  }

  getBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books`;
    return this.http.get<LibraryBook[]>(url)
      .pipe(
        map((items: LibraryBook[]) => items.map(item => item.book))
      );
  }

  getBook(libraryId: number, bid: number): Observable<Book> {
    const url = `${this.apiUrl}${libraryId}/books/${bid}`;
    return this.http.get<Book>(url);
  }

  getAvailableBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books/available`;
    return this.http.get<Book[]>(url);
  }

  getCheckedOutBooks(libraryId: number): Observable<Book[]> {
    const url = `${this.apiUrl}${libraryId}/books/checkedout`;
    return this.http.get<Book[]>(url);
  }

  /**
   * For a given library and given book return the total number of copies for the book
   *
   * @param {number} libraryId Library to look for book
   * @param {number} bookId Book to find
   * @returns {Observable<number>} Count of books
   * @memberof BooksService
   */
  getTotalNumberOfCopiesInLibrary(libraryId: number, bookId: number): Observable<number> {
    // TODO: Add implementation
    return of(0);
  }

  /**
   * This function should calculate the number of available copies of a book within a library given a libraryId and a bookId
   * using the api
   *
   * @param {number} libraryId
   * @param {number} bookId
   * @returns {Observable<number>}
   * @memberof BooksService
   */
  getNumberOfAvailableBookCopies(libraryId: number, bookId: number): Observable<number> {
    const url: string = `${this.apiUrl}${libraryId}/books/${bookId}/available-book-count`;
    return this.http.get<number>(url);
  }

  checkOutBook(libraryId: number, bookId: number, memberId: number): Observable<SignedOutBook> {
    const url = `${this.apiUrl}${libraryId}/books/${bookId}/signout/${memberId}`;
    return this.http.post<SignedOutBook>(url, {});
  }

  returnBook(libraryId: number, bookId: number, memberId: number): Observable<SignedOutBook> {
    const url = `${this.apiUrl}${libraryId}/books/${bookId}/return/${memberId}`;
    return this.http.put<SignedOutBook>(url, {});
  }

  /**
   * Gets all the meta information for the book
   * The google api reference to get meta data https://developers.google.com/books/docs/v1/using
   *
   * @param {string} isbn
   * @returns {Observable<GoogleBooksMetadata>}
   * @memberof BooksService
   */
  getBookMetaData(isbn: string): Observable<GoogleBooksMetadata> {
    const sanitizeIsbn: string = isbn.replace('-', '');

    const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${sanitizeIsbn}&key=${this.googleBooksAPIKey}`;

    return this.http.get(url)
      .pipe(
        map(metadata => {
          const bookMetdata: GoogleBooksMetadata =  {
            description: '',
            authors: [],
            imageLinks: {
              thumbnail: '',
              smallThumbnail: ''
            }
          };

          if (metadata['items'] && metadata['items'].length > 0) {
            bookMetdata.description = metadata['items'][0]['volumeInfo']['description'];
            bookMetdata.authors = metadata['items'][0]['volumeInfo']['authors'];
            bookMetdata.imageLinks.thumbnail = metadata['items'][0]['volumeInfo']['imageLinks']['thumbnail'];
            bookMetdata.imageLinks.smallThumbnail = metadata['items'][0]['volumeInfo']['imageLinks']['smallThumbnail'];
          }
          
          return bookMetdata;
        })
      );
  }

}
