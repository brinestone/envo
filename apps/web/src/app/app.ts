import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { HlmToaster } from "@spartan/ui/sonner";

@Component({
  selector: "ev-root",
  imports: [RouterOutlet, HlmToaster],
  templateUrl: "./app.html",
  styleUrl: "./app.scss",
})
export class App {}
