export abstract class DataSource<T> {
  abstract connect(): any;
  abstract disconnect(): any;
}


