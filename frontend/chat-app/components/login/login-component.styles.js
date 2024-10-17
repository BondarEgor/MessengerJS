export function getLoginComponentStyles() {
  return `
    <style>
        @import url('../common.css');

        .login-form{
          display: flex;
          flex-direction: column;
          justify-content:center;
          border: 1px solid gray;
          border-radius:8px;
          min-width: 500px;
          min-height: 500px;
          padding: 0 20px;
        }
        
        .login-form .title-h2 {
            font-size: 1.9em;
        }

        .divider {
            display:inline-block;
            background-color: gray;
            height: 1px;
        }

        .login-form .input-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 10px;
            margin-bottom: 30px;
        }

        .login-form .input-container > input {
            padding: 10px;
            border-radius: 8px;
            outline: none;
            border: 1px solid gray;
            background-color: transparent;
        }
        
         .login-form > button {
            padding: 10px 5px;
            border-radius: 5px;
            border: none;
            font-size: 20px;
            transition: all ease 0.3s;
        }

        .login-form > button:hover {
            opacity: 0.7;
            cursor: pointer;
        }

        .login-form > button:active {
            opacity: 0.5;
        }
    </style>
    `;
}
