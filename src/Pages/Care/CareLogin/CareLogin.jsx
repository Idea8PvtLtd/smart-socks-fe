import React, { useState } from 'react';
import './CareLogin.css'
import authData from '../../../Jsons/DbJson/Auth.json';
import AlertDemo from '../../../Components/Alert/AlertDemo';
import content from '../../../Jsons/Content/Content.json';
import { useNavigate } from 'react-router-dom';

function CareLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alertType, setAlertType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const users = Object.values(authData.CareLogin);
    const found = users.find(user => user.email === email && user.password === password);
    if (found) {
      setAlertType('success');
      setTimeout(() => {
        navigate('/overview');
      }, 1000);
    } else {
      setAlertType('invalid');
    }
  };

  return (
    <div className='mainPage'>
      <div className='loginContiner'>
        <div className='loginBox'>
          <div className='loginTBox'>
            <div className='loginLeftImg'>

            </div>
          </div>
          <div className='loginTBox'>
            <div className='login_form_box'>
              <div className='login_form_header'>
                <img src='/milbotix.png' alt='logo' className='login_from_logo'></img>
                <h2 className='login_h2'>{content.careLogin.title}</h2>
              </div>

              <form className='login_form' onSubmit={handleSubmit}>
                <div className='inputDiv'>
                  <label className='from_lable'>{content.careLogin.emailLabel}</label>
                  <input type='email' required name='email' id='email' className='from_input' value={email} onChange={e => setEmail(e.target.value)}></input>
                </div>
                <div className='inputDiv'>
                  <label className='from_lable'>{content.careLogin.passwordLabel}</label>
                  <input type='password' required name='password' id='password' className='from_input' value={password} onChange={e => setPassword(e.target.value)}></input>
                </div>
                <button type='submit' className='loginBtn'>{content.careLogin.loginButton}</button>
              </form>
            </div>
          </div>
        </div>
        <div className='Alert'>
          {alertType === 'success' && (
            <AlertDemo
              type='success'
              title={content.careLogin.successTitle}
              message={content.careLogin.successMessage}
              onClose={() => setAlertType('')}
            />
          )}
          {alertType === 'invalid' && (
            <AlertDemo
              type='invalid'
              title={content.careLogin.invalidTitle}
              message={content.careLogin.invalidMessage}
              onClose={() => setAlertType('')}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CareLogin
