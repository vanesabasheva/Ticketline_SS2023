import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {AuthRequest} from '../../dtos/authentication/auth-request';
import {UserService} from '../../services/user.service';
import {ToastrService} from 'ngx-toastr';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: UntypedFormGroup;
  // After first submission attempt, form validation will start
  submitted = false;
  // Error flag
  error = false;
  errorMessage = '';

  constructor(private formBuilder: UntypedFormBuilder,
              private authService: AuthService,
              private notification: ToastrService,
              private router: Router,
              private userService: UserService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Form validation will start after the method is called, additionally an AuthRequest will be sent
   */
  loginUser() {
    this.submitted = true;
    if (this.loginForm.valid) {
      const authRequest: AuthRequest = new AuthRequest(this.loginForm.controls.username.value, this.loginForm.controls.password.value);
      this.authenticateUser(authRequest);
    } else {
      console.log('Invalid input');
    }
  }

  /**
   * Send authentication data to the authService. If the authentication was successfully, the user will be forwarded to the message page
   *
   * @param authRequest authentication data from the user login form
   */
  authenticateUser(authRequest: AuthRequest) {
    console.log('Try to authenticate user: ' + authRequest.email);
    this.authService.loginUser(authRequest).subscribe({
      next: () => {
        console.log('Successfully logged in user: ' + authRequest.email);
        this.userService.getUserPoints(this.authService.getUserId());
        this.router.navigate(['/news']);
      },
      error: error => {
        console.log('Could not log in due to:');
        console.log(error);
        this.error = true;


        if (typeof error.error === 'object') {
          this.notification.error(error.error.detail);
        } else {
          try {
            this.notification.error(JSON.parse(error.error).detail);
          } catch (exception) {
            this.notification.error(error.error);
          }
        }
      }
    });
  }

  /**
   * Error flag will be deactivated, which clears the error message
   */
  vanishError() {
    this.error = false;
  }

  ngOnInit() {
  }

}
