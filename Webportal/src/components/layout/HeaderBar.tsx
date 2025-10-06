import { Button, Descriptions, Switch } from 'antd'
import { useEffect, useState } from 'react'
import { PageHeader } from '@ant-design/pro-layout';
type HeaderBarProps = {
  title: string
  button?: boolean
  buttonText?: string
  buttonCallback?: () => void
  descriptionText?: string
  buttonLoading?: boolean
}

const HeaderBar = ({
  title,
  button,
  buttonText,
  buttonCallback,
  descriptionText,
  buttonLoading,
}: HeaderBarProps) => {
  let timer;
  // logs out user by clearing out auth token in localStorage and redirecting url to /signin page.
  const logoutAction = () => {
    localStorage.clear();
    window.location.pathname = "/what2study/home";
  };
  const events = [
    "load",
    "mousemove",
    "mousedown",
    "click",
    "scroll",
    "keypress",
  ];
  const handleLogoutTimer = () => {
    timer = setTimeout(() => {
      // clears any pending timer.
      resetTimer();
      // Listener clean up. Removes the existing event listener from the window
      Object.values(events).forEach((item) => {
        window.removeEventListener(item, resetTimer);
      });
      // logs out user
      logoutAction();
    }, 3600000);
  };
  // this resets the timer if it exists.
  const resetTimer = () => {
    if (timer) clearTimeout(timer);
  };
  const [titleIsHere, setTtitle]=useState<string>(title)
  useEffect(()=>{
    Object.values(events).forEach((item) => {
      window.addEventListener(item, () => {
        resetTimer();
        handleLogoutTimer();
      });
    });
  },[titleIsHere])
  return (
    <PageHeader
      title={title}
      extra={
        button && buttonText && buttonCallback ? (
        
          <Button
          style={{marginBottom:"10px"}}
            type='primary'
            onClick={() => buttonCallback()}
            loading={buttonLoading}
            disabled={buttonLoading}
          >
            {buttonText}
          </Button>
        ) : null
      }
    >
      {descriptionText && (
        <Descriptions>
          <Descriptions.Item>{descriptionText}</Descriptions.Item>
        </Descriptions>
      )}
    </PageHeader>
  )
}

export default HeaderBar
