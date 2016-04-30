import { AngularFileSortProcessor } from './processor';

export default function transform(opts) {
  return new AngularFileSortProcessor(opts).createPostprocessor();
}


