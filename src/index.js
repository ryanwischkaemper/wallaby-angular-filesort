import { AngularFileSortProcessor } from './processor';

export function transform(opts) {
  return new AngularFileSortProcessor(opts).createPostprocessor();
}


