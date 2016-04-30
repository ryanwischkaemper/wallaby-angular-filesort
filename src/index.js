import {AngularFileSort} from './sort';

export default function transform(opts){
	return new AngularFileSort(opts).createPostprocessor();
}


