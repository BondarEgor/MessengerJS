import { getLoginComponentStyles } from "./login-component.styles";

export function createTemplate() {
  return `
    ${getLoginComponentStyles()}

    <form class='login-form'>
        <h2 class='title-h2'>Welcome back to Chat!</h2>
       <div class='input-container'>
        <input type='text' class='email' placeholder='Email'>
        <input type='password' class='password' placeholder='Password'>
       </div>
        <button type='submit'> Login </button>
        <p>Don't have an account yet? Please register <a href='#'>here</a></p>
    </form>
    `;
}
