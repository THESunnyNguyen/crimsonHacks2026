// Imported only by the disposable demo runner, never by the application.
// Friday morning gives deterministic today/tomorrow pickup slots on any day.
const RealDate = Date;
const started = RealDate.now();
const epoch = RealDate.parse("2026-11-06T15:00:00Z");
globalThis.Date = class extends RealDate {
  constructor(...args) {
    super(...(args.length ? args : [epoch + RealDate.now() - started]));
  }
  static now() {
    return epoch + RealDate.now() - started;
  }
};
