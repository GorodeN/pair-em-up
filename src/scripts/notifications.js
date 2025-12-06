class Notifications {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = 'notifications';
    document.body.appendChild(this.container);
  }

  show(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;

    this.container.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);

    return notification;
  }

  clear() {
    this.container.innerHTML = '';
  }
}

export default Notifications;
