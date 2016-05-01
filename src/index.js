import { PostProcessor } from './PostProcessor';

export function create(opts) {
  return new PostProcessor(opts).create();
}


