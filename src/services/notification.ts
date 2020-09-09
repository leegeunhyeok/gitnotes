interface NotificationEvent {
  message: string | null;
  show: boolean;
}

type NotificationHandler = (event: NotificationEvent) => void;

export default class NotificationController {
  public static DURATION = 3000;
  private static instance: NotificationController | null = null;
  private _timer = 0;
  private _show = false;
  private f: NotificationHandler | null = null;

  private constructor() {
    NotificationController.instance = this;
  }

  public static getInstance() {
    if (!NotificationController.instance) {
      NotificationController.instance = new NotificationController();
    }
    return NotificationController.instance;
  }

  private show(message: string) {
    this.f &&
      this.f({
        show: true,
        message,
      });

    this._timer = window.setTimeout(() => {
      this.hide();
    }, NotificationController.DURATION);
  }

  private hide() {
    this.f &&
      this.f({
        message: null,
        show: false,
      });
  }

  register(f: NotificationHandler) {
    this.f = f;
  }

  showNotification(message: string) {
    window.clearTimeout(this._timer);
    if (this._show) {
      this.hide();
      this._timer = window.setTimeout(() => {
        this.show(message);
      }, NotificationController.DURATION);
    } else {
      this.show(message);
    }
  }
}

export const showNotification = (message: string) =>
  NotificationController.getInstance().showNotification(message);
