import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { ZardSonnerComponent } from "@zard/components/sonner";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, ZardSonnerComponent],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {}
