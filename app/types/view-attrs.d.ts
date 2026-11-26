// View's CSS tooltips (`[tooltip]` / `[flow]` in 01-settings/global.scss) read
// these plain attributes, exactly as the Twig markup writes them.
import 'react';

declare module 'react' {
  interface HTMLAttributes<T> {
    tooltip?: string;
    flow?: 'up' | 'down' | 'left' | 'right' | string;
  }
}
