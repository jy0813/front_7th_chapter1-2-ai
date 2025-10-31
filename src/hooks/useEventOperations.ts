import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      const url = editing ? `/api/events/${(eventData as Event).id}` : '/api/events';
      const method = editing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();

      const successMessage = editing ? '일정이 수정되었습니다.' : '일정이 추가되었습니다.';
      enqueueSnackbar(successMessage, { variant: 'success' });

      return true;
    } catch (error) {
      console.error('Error saving event:', error);

      const errorMessage = editing ? '일정 수정에 실패했습니다' : '일정 저장 실패';
      enqueueSnackbar(errorMessage, { variant: 'error' });

      return false;
    }
  };

  const saveMultipleEvents = async (eventsData: EventForm[]) => {
    try {
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsData }),
      });

      if (!response.ok) {
        throw new Error('Failed to save multiple events');
      }

      await fetchEvents();
      onSave?.();

      return true;
    } catch (error) {
      console.error('Error saving multiple events:', error);
      throw error; // 상위에서 에러 처리
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar('일정이 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar('일정 삭제 실패', { variant: 'error' });
    }
  };

  const updateRecurringSeries = async (repeatId: string, updateData: Partial<EventForm>) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update recurring series');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정 시리즈가 수정되었습니다.', { variant: 'success' });
      return true;
    } catch (error) {
      console.error('Error updating recurring series:', error);
      enqueueSnackbar('반복 일정 수정에 실패했습니다', { variant: 'error' });
      return false;
    }
  };

  const deleteRecurringSeries = async (repeatId: string) => {
    try {
      const response = await fetch(`/api/recurring-events/${repeatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete recurring series');
      }

      await fetchEvents();
      enqueueSnackbar('반복 일정 시리즈가 삭제되었습니다.', { variant: 'info' });
    } catch (error) {
      console.error('Error deleting recurring series:', error);
      enqueueSnackbar('반복 일정 삭제 실패', { variant: 'error' });
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar('일정 로딩 완료!', { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    events,
    fetchEvents,
    saveEvent,
    saveMultipleEvents,
    deleteEvent,
    updateRecurringSeries,
    deleteRecurringSeries,
  };
};
