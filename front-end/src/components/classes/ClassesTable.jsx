import { School, Pencil, Trash2, Eye } from "lucide-react";
import NoDataAvailable from "../global/NoDataAvailable";
import ConfirmModal from "../global/ConfirmModal";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
    deleteClass,
    clearClassDeleteError,
    clearClassDeleteMessage,
    getClasses,
    handleTableActions,
} from "../../store/slices/classes.slice";
import { setErrorAlert, setSuccessAlert } from "../../store/slices/alert.slice";
import PageLoading from "../global/PageLoading";
import PageError from "../global/PageError";
import Modal from "../global/Modal";
import UpdateClassForm from "./UpdateClassForm";
import { Link } from "react-router";

export default function ClassesTable({ isAdmin }) {
    const dispatch = useDispatch();
    const {
        data,
        loading,
        error,
        tableActions: { search, level, page, limit, mine, studentId },
    } = useSelector((state) => state.classes.classesList);
    const {
        message,
        deleting,
        error: deleteError,
    } = useSelector((state) => state.classes.deleteData);

    // Handle Fetch Classes
    useEffect(() => {
        dispatch(getClasses({ search, level, page, limit, mine, studentId }));
    }, [dispatch, search, level, page, limit, mine, studentId]);

    function handlePaginationActions(action) {
        const value =
            action === "prev" ? data.currentPage - 1 : data.currentPage + 1;

        dispatch(handleTableActions({ key: "page", value }));
    }

    function handleChangeClassesLimit(e) {
        const newLimit = +e.target.value || 15;

        dispatch(handleTableActions({ key: "limit", value: newLimit }));
    }

    // Handle Delete Class
    const [classToDelete, setClassToDelete] = useState(null);

    useEffect(() => {
        if (message) {
            dispatch(setSuccessAlert(message));
            dispatch(clearClassDeleteMessage());
        }

        if (deleteError) {
            dispatch(setErrorAlert(deleteError.message));
            dispatch(clearClassDeleteError());
        }
    }, [message, deleteError, dispatch]);

    async function handleConfirmDelete() {
        dispatch(deleteClass(classToDelete._id));

        setClassToDelete(null);
    }

    // Handle Update Class
    const [classToUpdate, setClassToUpdate] = useState(null);

    return (
        <>
            <div className="mt-5 overflow-x-auto">
                {loading && <PageLoading />}
                {error && <PageError message={error.message} />}

                {(!data || !data?.classes?.length) && (
                    <NoDataAvailable message="No classes available." />
                )}

                {data?.classes?.length > 0 && (
                    <table className="w-full min-w-[630px] border-collapse text-left">
                        <thead>
                            <tr className="text-xs font-medium text-slate-400">
                                <th className="pb-3 pr-4">Class</th>
                                <th className="pb-3 pr-4">Subject</th>
                                <th className="pb-3 pr-4">Room</th>
                                <th className="pb-3 pr-4">Students</th>
                                <th className="pb-3 pr-4">Status</th>
                                <th className="pb-3 pr-4">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {data.classes.map((currentClass) => {
                                const hasTeacher = !!currentClass.teacherId;

                                return (
                                    <tr
                                        key={currentClass._id}
                                        className="border-t border-slate-50 text-sm hover:bg-violet-50"
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                                                    <School className="h-4 w-4" />
                                                </span>

                                                <div>
                                                    <p className="font-semibold text-slate-800 capitalize">
                                                        {currentClass.level} -
                                                        Year{" "}
                                                        {currentClass.levelYear}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        Group{" "}
                                                        {currentClass.group}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3 pr-4 text-slate-600 capitalize">
                                            {currentClass.subjectId?.title ||
                                                "—"}
                                        </td>

                                        <td className="py-3 pr-4 text-slate-600">
                                            {currentClass.schoolRoomId
                                                ? `${currentClass.schoolRoomId.title} (#${currentClass.schoolRoomId.roomNumber})`
                                                : "—"}
                                        </td>

                                        <td className="py-3 pr-4 text-slate-600">
                                            {currentClass.students?.length || 0}
                                        </td>

                                        <td className="py-3 pr-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    hasTeacher
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-amber-100 text-amber-700"
                                                }`}
                                            >
                                                {hasTeacher
                                                    ? "Assigned"
                                                    : "Unassigned"}
                                            </span>
                                        </td>

                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/classes/${currentClass._id}`}
                                                    className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 cursor-pointer"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>
                                                {isAdmin && (
                                                    <>
                                                        <button
                                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-teal-600 transition hover:bg-teal-200 cursor-pointer"
                                                            onClick={() =>
                                                                setClassToUpdate(
                                                                    currentClass
                                                                )
                                                            }
                                                            title="Update Class"
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>

                                                        <button
                                                            className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-violet-600 transition hover:bg-violet-200 cursor-pointer"
                                                            onClick={() =>
                                                                setClassToDelete(
                                                                    currentClass
                                                                )
                                                            }
                                                            title="Delete Class"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="mt-5 flex items-center justify-between text-sm max-md:flex-col max-md:gap-3">
                <p className="text-slate-500">
                    Total Pages: {data?.totalPages || 0}
                </p>

                <div className="flex items-center gap-5">
                    <button
                        className={`rounded-lg px-3 py-1.5 ${
                            data?.currentPage === 1
                                ? "text-slate-300"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                        disabled={data?.currentPage === 1}
                        onClick={() => handlePaginationActions("prev")}
                    >
                        Prev
                    </button>

                    <button className="h-7 w-7 rounded-md bg-sky-100 font-medium text-sky-600">
                        {data?.currentPage || 1}
                    </button>

                    <button
                        className={`rounded-lg px-3 py-1.5 ${
                            data?.currentPage === data?.totalPages
                                ? "text-slate-300"
                                : "text-slate-600 hover:bg-slate-100"
                        }`}
                        disabled={data?.currentPage === data?.totalPages}
                        onClick={() => handlePaginationActions("next")}
                    >
                        Next
                    </button>
                </div>

                <div className="text-slate-500">
                    <span>Classes per page:</span>
                    <select
                        name="classesPerPage"
                        id="classesPerPage"
                        onChange={handleChangeClassesLimit}
                        value={limit}
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                </div>
            </div>

            {isAdmin && (
                <>
                    {classToUpdate && (
                        <Modal
                            isOpen={classToUpdate}
                            onClose={() => setClassToUpdate(null)}
                            title="Update Class"
                        >
                            <UpdateClassForm
                                onClose={() => setClassToUpdate(null)}
                                classToUpdate={classToUpdate}
                                onUpdated={() =>
                                    dispatch(
                                        getClasses({
                                            search,
                                            level,
                                            page,
                                            limit,
                                        })
                                    )
                                }
                            />
                        </Modal>
                    )}

                    <ConfirmModal
                        isOpen={!!classToDelete}
                        onClose={() => setClassToDelete(null)}
                        onConfirm={handleConfirmDelete}
                        title="Delete Class"
                        message="Are you sure you want to delete this class? This action cannot be undone."
                        confirmLabel="Delete"
                        loading={deleting}
                    />
                </>
            )}
        </>
    );
}
