import { Component, OnInit } from '@angular/core';
import {Job} from '../../job/job';
import {ActivatedRoute} from '@angular/router';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {JobDetailComponent} from '../../job/job-detail/job-detail.component';
import {CsvCollectionService} from '../csv-collection.service';
import {CsvCollection} from '../csv-collection';
import {AppConfigService} from '../../app-config.service';
import urljoin from 'url-join';

@Component({
  selector: 'app-csv-collection-detail',
  templateUrl: './csv-collection-detail.component.html',
  styleUrls: ['./csv-collection-detail.component.css']
})
export class CsvCollectionDetailComponent implements OnInit {

  csvCollection: CsvCollection = new CsvCollection();
  job: Job = null;
  csvCollectionId = this.route.snapshot.paramMap.get('id');
  plotsUiLink = '';

  constructor(
    private route: ActivatedRoute,
    private modalService: NgbModal,
    private csvCollectionService: CsvCollectionService,
    private appConfigService: AppConfigService) {
  }

  ngOnInit() {
    this.plotsUiLink = urljoin(this.appConfigService.getConfig().plotsUiUrl, 'plots', this.csvCollectionId);
    this.csvCollectionService.getCsvCollection(this.csvCollectionId)
      .subscribe(csvCollection => {
        this.csvCollection = csvCollection;
        this.getJob();
      });
  }

  getJob() {
    if (this.csvCollection._links['sourceJob']) {
      this.csvCollectionService.getJob(this.csvCollection._links['sourceJob']['href']).subscribe(job => this.job = job);
    }
  }
  displayJobModal(jobId: string) {
    const modalRef = this.modalService.open(JobDetailComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.modalReference = modalRef;
    (modalRef.componentInstance as JobDetailComponent).jobId = jobId;
    modalRef.result.then((result) => {
      }
      , (reason) => {
        console.log('dismissed');
      });
  }

}
