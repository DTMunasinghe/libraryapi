﻿using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aka.Library.Data;
using Aka.Library.Data.Entities;
using Aka.Library.Data.Model;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Aka.Library.Api.Controllers
{
    [Produces("application/json")]
    [Route("api/libraries/{libraryId:int}/books")]
    public class LibraryBooksController : BaseController
    {
        public LibraryBooksController([FromServices] LibraryContext libraryContext)
            : base(libraryContext)
        { }

        // GET: api/LibraryBooks
        [HttpGet]
        public IEnumerable<LibraryBook> GetAllBooksFromLibrary(int libraryId)
        {
            var books = db.LibraryBook.Where(l => l.LibraryId == libraryId).Include(b => b.Book);

            return books.AsEnumerable();
        }

        /// <summary>
        /// Get all available books at the library
        /// </summary>
        /// <param name="libraryId">Library Id</param>
        /// <returns>Returns all available books</returns>
        [HttpGet("available")]
        public IEnumerable<Book> GetAvailableBooks(int libraryId)
        {
            var books = from bt in db.BookTitle
                        join lb in db.LibraryBook on bt.BookId equals lb.BookId into libraryBook
                        from lb in libraryBook
                        join signs in (
                                from bso in db.BookSignedOut
                                where bso.WhenReturned == null
                                group bso by bso.LibraryBookSid
                                into checkOuts
                                select new
                                {
                                    LibraryBookSId = checkOuts.Key,
                                    Count = (int?)checkOuts.Count()
                                }
                            )
                            on lb.LibraryBookSid equals signs.LibraryBookSId into booksSignOutsOuter
                        from signs in booksSignOutsOuter.DefaultIfEmpty()
                        where lb.LibraryId == libraryId && lb.TotalPurchasedByLibrary > (signs.Count ?? 0)
                        select new Book
                        {
                            BookId = bt.BookId,
                            Title = bt.Title,
                            Isbn = bt.Isbn,
                            DateOfPublication = bt.DateOfPublication,
                            IsAvailable = (lb.TotalPurchasedByLibrary - (signs.Count ?? 0)) > 0,
                        };

            return books;
        }

        /// <summary>
        /// Get all available books at the library that are currently checked out
        /// </summary>
        /// <param name="libraryId">Library Id</param>
        /// <returns>Returns all available books</returns>
        [HttpGet("checkedout")]
        public IEnumerable<BookTitle> GetCheckedOutBooks(int libraryId)
        {
            var checkOutBooks =
                (from bso in db.BookSignedOut
                    join lbs in db.LibraryBook on bso.LibraryBookSid equals lbs.LibraryBookSid into libraryBooks
                    from lb in libraryBooks
                    where bso.WhenReturned == null && lb.LibraryId == libraryId
                    group lb by lb.Book.Isbn
                    into checkOuts
                    select new
                    {
                        BookId = checkOuts.Key,
                        Book = checkOuts.Select(g => g.Book),
                        BookCount = checkOuts.Count()
                    }).ToDictionary(k=> k.BookId, v=> v.Book);

            var books = checkOutBooks.SelectMany(o => o.Value);
            return books;
        }

        // POST: api/LibraryBooks
        [HttpPost]
        public async Task Post(int libraryId, [FromBody]BookTitle book)
        {
            var library = await db.Library.FirstOrDefaultAsync(o => o.LibraryId == libraryId);
            var lb = new LibraryBook
            {
                Book = book,
                Library = library
            };

            db.LibraryBook.Add(lb);
            await db.SaveChangesAsync();
        }

        // PUT: api/LibraryBooks/5
        [HttpPut]
        public async Task Put(int libraryId, [FromBody]BookTitle book)
        {
            var lb = db.LibraryBook.FirstOrDefault(o => o.BookId == book.BookId && o.LibraryId == libraryId);

            if (lb == null)
            {
                db.LibraryBook.Remove(lb);
            }

            var newLibraryBook = new LibraryBook
            {
                Book = book,
                LibraryId = libraryId
            };

            db.LibraryBook.Add(newLibraryBook);

            await db.SaveChangesAsync();
        }

        //// DELETE: api/ApiWithActions/5
        //[HttpDelete("{bookId}")]
        //public async Task<bool> DeleteAsync(int libraryId, int bookId)
        //{
        //    var lb = db.LibraryBook.Where(o => o.BookId == bookId && o.LibraryId == libraryId);

        //    if (lb == null) { return false; }

        //    await lb.ForEachAsync(l => db.LibraryBook.Remove(l));
        //    await db.SaveChangesAsync();

        //    return true;
        //}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
