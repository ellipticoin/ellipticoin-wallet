import React from "react";
import Countdown from 'react-countdown';


const renderer = ({ hours, minutes, seconds, completed }) => {
  if (completed) {
    return <div>Tada it&apos;s ready!</div>;
  } else {
    return <span>{hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}</span>;
  }
};

export default function Wallet(props) {

  const [date] = React.useState(() => Date.parse('17 Jun 2020 11:00:00 EST'));
  return (<div>
    <p>Trading goes live on June 17th 2020 at 11am EST</p>
    Countdown: &nbsp;
     <Countdown
    precision={3}
    renderer={renderer}
    date={date}
    />
    </div>
  )
}
