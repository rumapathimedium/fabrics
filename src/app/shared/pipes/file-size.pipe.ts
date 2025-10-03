import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number, precision: number = 1): string {
    if (bytes === 0 || !bytes) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(precision));
    return `${size} ${sizes[i]}`;
  }
}