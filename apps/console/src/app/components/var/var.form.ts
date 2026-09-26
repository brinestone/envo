import { Component , input} from '@angular/core';
import { Variable } from '@envo/common';

@Component({
  selector: 'ev-var',
  imports: [],
  templateUrl: './var.form.html',
  styleUrl: './var.form.scss'
})
export class VarForm {
  readonly var = input.required<Variable>();
}
