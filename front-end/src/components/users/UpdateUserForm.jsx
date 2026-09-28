import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import InputError from "../global/InputError";
import InputLoading from "../global/InputLoading";

import { getInputError } from "../../lib/input.errors";
import {
    updateUser,
    clearUsersUpdateMessage,
    clearUsersUpdateError,
} from "../../store/slices/users.slice";
import { setErrorAlert, setSuccessAlert } from "../../store/slices/alert.slice";
import { Info } from "lucide-react";

export default function UpdateUserForm({ onClose, userToUpdate, onUpdate }) {
    const dispatch = useDispatch();
    const { message, updating, error } = useSelector(
        (state) => state.users.updateData
    );

    const [form, setForm] = useState({
        fullName: userToUpdate?.fullName || "",
        email: userToUpdate?.email || "",
        phoneNumber: userToUpdate?.phoneNumber || "",
        gender: userToUpdate?.gender || "male",
        password: "",
        passwordConfirm: "",
    });

    useEffect(() => {
        if (error && !error.errors) {
            dispatch(setErrorAlert(error.message));
        }

        if (message) {
            dispatch(setSuccessAlert(message));

            onUpdate?.();
            onClose();

            dispatch(clearUsersUpdateMessage());
            dispatch(clearUsersUpdateError());
        }
    }, [dispatch, message, error]);

    const inputErrors = error?.errors ? getInputError(error.errors) : {};

    const updateField = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        dispatch(
            updateUser({
                userId: userToUpdate._id,
                ...form,
            })
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Personal Information
                </p>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={updateField("fullName")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputErrors.fullName && (
                            <InputError message={inputErrors.fullName} />
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Email
                        </label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={updateField("email")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputErrors.email && (
                            <InputError message={inputErrors.email} />
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Phone
                        </label>
                        <input
                            type="text"
                            value={form.phoneNumber}
                            onChange={updateField("phoneNumber")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputErrors.phoneNumber && (
                            <InputError message={inputErrors.phoneNumber} />
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Gender
                        </label>
                        <select
                            value={form.gender}
                            onChange={updateField("gender")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {inputErrors.gender && (
                            <InputError message={inputErrors.gender} />
                        )}
                    </div>
                </div>
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Authentication Information
                </p>

                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Password
                        </label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={updateField("password")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputErrors.password && (
                            <InputError message={inputErrors.password} />
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={form.passwordConfirm}
                            onChange={updateField("passwordConfirm")}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                        {inputErrors.passwordConfirm && (
                            <InputError message={inputErrors.passwordConfirm} />
                        )}
                    </div>
                </div>

                <div className="mt-2 text-xs tracking-wide text-slate-400 flex  gap-1">
                    <Info size={15} />
                    <p>
                        Fill the <span className="font-bold">password</span> and{" "}
                        <span className="font-bold">confirm password</span>{" "}
                        fields to reset the password; otherwise, keep them
                        empty!
                    </p>
                </div>
            </div>

            <button
                type="submit"
                disabled={updating}
                className="w-full rounded-md bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 cursor-pointer"
            >
                {updating ? <InputLoading /> : "Update"}
            </button>
        </form>
    );
}
