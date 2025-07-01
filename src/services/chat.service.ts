import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, timer, of } from 'rxjs';
import { switchMap, catchError, take } from 'rxjs/operators';
import { ChatMessage, SendMessageRequest } from '../models/message.interface';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_BASE_URL = 'http://localhost:8080/message';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private pollingInterval = 2000; // Poll every 2 seconds

  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.startPolling();
  }

  private startPolling(): void {
    timer(0, this.pollingInterval)
      .pipe(
        switchMap(() => this.fetchMessages()),
        catchError(error => {
          console.error('Error fetching messages:', error);
          // Return mock messages for demo purposes when backend is not available
          return of(this.getMockMessages());
        })
      )
      .subscribe(messages => {
        this.messagesSubject.next(messages);
      });
  }

  sendMessage(messageRequest : SendMessageRequest) : Observable<ChatMessage>{
    this.send(messageRequest).subscribe(response =>{
       console.log(response);
    })
    return of(this.getMockMessages()[0]);
  }

  private fetchMessages(): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.API_BASE_URL}`);
  }

 private send(messageRequest: SendMessageRequest): Observable<any> {
      return this.http.post<SendMessageRequest>(this.API_BASE_URL,messageRequest); 
  }

  private getMockMessages(): ChatMessage[] {
    return [
      {
        id: '1',
        content: 'Hello! Welcome to the Shield 2.O, What is your next move?',
        sender: 'AI',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        isCurrentUser: false
      }
    ];
  }
}