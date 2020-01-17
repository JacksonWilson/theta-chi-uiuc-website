import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { TcEventAttendance } from './attendance.model';
import { Observable } from 'rxjs';
import { TcEvent } from '../event/event.model';
import { EventService } from '../event/event.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  constructor(
    private afs: AngularFirestore,
    private eventsService: EventService
  ) { }

  public addAttendance(eventAttendance: TcEventAttendance, event: TcEvent): void {
    const id = this.afs.createId();
    const eventRef: AngularFirestoreDocument<any> = this.afs.doc(`attendance/${id}`);
    eventAttendance.id = id;
    event.attendanceId = id;
    this.eventsService.updateEvent(event);

    const obj = Object.assign({}, eventAttendance);
    eventRef.set(obj, { merge: false }).then(() => {
      console.log('Added event attendance to db.');
    }).catch(err => {
      console.log('Failed to add event attendance to db: ', err);
    });
  }

  public updateAttendance(eventAttendance: TcEventAttendance): void {
    if (!eventAttendance.id) {
      console.log('Failed to update event attendance in db: id is undefined');
      return;
    }

    const attendanceRef: AngularFirestoreDocument<any> = this.afs.doc(`attendance/${eventAttendance.id}`);

    const obj = Object.assign({}, eventAttendance);
    attendanceRef.set(obj, { merge: true }).then(() => {
      console.log('Updated event attendance in db.');
    }).catch(err => {
      console.log('Failed to update event attendance in db: ', err);
    });
  }

  public removeAttendance(id: string): void {
    if (!id) {
      return;
    }

    const attendanceRef: AngularFirestoreDocument<any> = this.afs.doc(`events/${id}`);

    attendanceRef.delete().then(res => {
      console.log('Deleted event attendance db entry: ', res);
    }).catch(err => {
      console.log('Failed to delete event attendance db entry: ', err);
    });
  }

  public getAttendanceById(attendanceId: string): Observable<TcEventAttendance> {
    return this.afs.collection('attendance').doc<any>(attendanceId).valueChanges().pipe(map((doc, index) => this.convertDocToAttendance(doc)));
  }

  public async getAll(): Promise<TcEventAttendance[]> {
    let events: Array<TcEventAttendance> = [];

    var eventsRef = this.afs.collection('attendance').ref;

    const data = await eventsRef.get();

    data.forEach(doc => {
      events.push(this.convertDocToAttendance(doc));
    });

    return events;
  }

  private convertDocToAttendance(doc: any): TcEventAttendance {
    let eventAttendance = <TcEventAttendance>doc;
    const startDateTime = <firebase.firestore.Timestamp><unknown>eventAttendance.startDateTime
    eventAttendance.startDateTime = startDateTime.toDate();
    const eventStartDateTime = <firebase.firestore.Timestamp><unknown>eventAttendance.eventStartDateTime
    eventAttendance.eventStartDateTime = eventStartDateTime.toDate();
    const eventEndDateTime = <firebase.firestore.Timestamp><unknown>eventAttendance.eventEndDateTime
    eventAttendance.eventEndDateTime = eventEndDateTime.toDate();
    return eventAttendance;
  }
}
