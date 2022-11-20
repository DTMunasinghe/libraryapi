import { Router } from '@angular/router';
import { LibrariesService } from '../../services/libraries.service';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Library } from '../../shared/library';
import { MatTableDataSource, MatSort } from '@angular/material';
import { slideInDownAnimation } from '../../animations';

@Component({
  selector: 'app-library-list',
  templateUrl: './library-list.component.html',
  styleUrls: ['./library-list.component.scss'],
  animations: [slideInDownAnimation]
})
export class LibraryListComponent implements OnInit, AfterViewInit {
  
  displayedColumns = ['libraryId', 'name', 'city'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private router: Router,
    private libraryService: LibrariesService) { }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnInit() {
    this.libraryService.getLibraries().subscribe(data => this.dataSource.data = data);
  }

  selectRow(library: Library) {
    this.router.navigate(['/libraries', library.libraryId]);
  }

  /**
   * Set the sort after the view init since this component will
   * be able to query its view for the initialized sort.
   */
  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

}
