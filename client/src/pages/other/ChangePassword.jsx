import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  changePasswordBySelf,
  messageClear,
} from '../../redux/reducer/authReducer';

function ChangePassword() {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { oldPassword, newPassword, confirmPassword } = formData;

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New Password and Confirm Password should be same');
      return;
    }

    try {
      const response = await dispatch(
        changePasswordBySelf({ oldPassword, newPassword })
      ).unwrap();
      toast.success(response?.message || 'Password changed successfully');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      dispatch(messageClear());
    } catch (error) {
      toast.error(error?.message || 'Failed to change password');
      dispatch(messageClear());
    }
  };

  return (
    <div className='w-full p-0.5'>
      <div className='w-full border border-[#00000020] bg-white shadow-[0_0_5px_#a4a4a4]'>
        <div className='bg-secondary text-secondary p-2'>
          <h4 className='text-[16px] font-normal'>Change Password</h4>
        </div>
        <div className='mb-2 w-full px-2 lg:w-[50%]'>
          <form className='flex flex-col gap-2' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='Current Password'
                className='text-[16px] font-normal text-[#000000]'
              >
                Current Password:
              </label>
              <input
                type='password'
                id='Current Password'
                name='oldPassword'
                placeholder='Enter your current password'
                value={formData.oldPassword}
                onChange={handleChange}
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='New Password'
                className='text-[16px] font-normal text-[#000000]'
              >
                New Password:
              </label>
              <input
                type='password'
                id='New Password'
                name='newPassword'
                placeholder='Enter your new password'
                value={formData.newPassword}
                onChange={handleChange}
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <div className='flex flex-col gap-1'>
              <label
                htmlFor='Confirm Password'
                className='text-[16px] font-normal text-[#000000]'
              >
                {' '}
                Confirm Password:
              </label>
              <input
                type='password'
                id='Confirm Password'
                name='confirmPassword'
                placeholder='Enter your confirm password'
                value={formData.confirmPassword}
                onChange={handleChange}
                className='border border-[#dbdbdb] p-1 outline-none'
              />
            </div>
            <button
              type='submit'
              disabled={loading}
              className='bg-primary text-primary w-full rounded-xs p-1 text-[16px] font-normal disabled:opacity-60'
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
