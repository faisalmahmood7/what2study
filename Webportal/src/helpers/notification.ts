import { notification } from 'antd'

type ShowNotificationProps = {
  title: string
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  long?: boolean
}

/**
 * Shows a notification badge to the user
 */
export const showNotification = ({
  title,
  message,
  type,
  long,
}: ShowNotificationProps) => {
  notification[type || 'info']({
    message: title,
    description: message,
    duration: 3,
  })
}
