import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Job} from '../job';
import {JobService} from '../job.service';
import {Plugin} from '../../plugin/plugin';
import 'rxjs-compat/add/operator/map';
import {Workflow} from '../../workflow/workflow';

export interface IdHash {
  [nameId: string]: string;
}

@Component({
  selector: 'app-job-detail',
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css']
})

export class JobDetailComponent implements OnInit {

  @Input() modalReference: any;

  jobId: string;
  job: Job;
  showInputs = false;
  showOutputs = false;
  plugin: Plugin;
  inputOrigins = [];
  workflow: Workflow;
  outputHash: IdHash = {};

  constructor(private activeModal: NgbActiveModal,
              private jobService: JobService) {
  }

  ngOnInit() {
    this.getJob();
  }

  getJob() {
    this.jobService.getJob(this.jobId).subscribe(job => {
        this.job = job;
        this.getPlugin();
        this.job.runningTime = (this.job.endTime && this.job.startTime) ?
          new Date(this.job.endTime.valueOf() - this.job.startTime.valueOf()) : null;
        this.jobService.getWorkflow(this.job.wippWorkflow).subscribe(workflow =>
          this.workflow = workflow);
      }
    );
  }

  getPlugin() {
    this.jobService.getPlugin(this.job.wippExecutable).subscribe(plugin => {
        this.plugin = plugin;
        this.getInputOrigins();
      }
    );
  }

  // go through the list of inputs to get the names of previous tasks
  getInputOrigins() {
    this.inputOrigins.length = this.plugin.inputs.length;
    for (let i = 0; i < this.plugin.inputs.length; i++) {
      const input = this.plugin.inputs[i];
      const inputValue = this.job.parameters[(<string>input['name'])];
      if (inputValue && inputValue.search('{{') !== -1) {
        const data = this.getIdFromInputName(inputValue);
        const id = data[0];
        const outputName = data[1];
        this.jobService.getJob(id).subscribe(job => {
          this.inputOrigins[i] = job.name + outputName;
          this.outputHash[job.name + outputName] = job.outputParameters[outputName.substr(1)];
        });
      }
    }
  }

  getIdFromInputName(inputName: string) {
    const idToOutputDelimiter = inputName.indexOf('.');
    const idFirstLetter = inputName.indexOf(' ') + 1;
    const outputName = inputName.substr(idToOutputDelimiter, inputName.length - idToOutputDelimiter - idFirstLetter);
    const id = inputName.substr(idFirstLetter, idToOutputDelimiter - idFirstLetter);
    return [id, outputName];
  }

}
