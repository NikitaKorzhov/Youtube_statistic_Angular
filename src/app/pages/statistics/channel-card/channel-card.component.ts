import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Channel } from '../../../_models/Channel';

/**
 * Presentational (dumb) component that renders a single channel card.
 * Receives data via @Input only and contains no business logic.
 */
@Component({
  selector: 'app-channel-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatExpansionModule, MatProgressBarModule],
  templateUrl: './channel-card.component.html',
  styleUrl: './channel-card.component.scss',
})
export class ChannelCardComponent {
  @Input({ required: true }) channel!: Channel;
}
