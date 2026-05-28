import React from 'react'
import { useParams } from 'react-router-dom'

const EventDetails = () => {
  const params = useParams();
  const eventId = params.eventId;

  return (
    <div>EventDetails {eventId}</div>
  )
}

export default EventDetails;
