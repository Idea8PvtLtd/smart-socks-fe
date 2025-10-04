import { useNavigate } from "react-router-dom";
import { TbLogout2 } from "react-icons/tb";
function LogOut({ onClose }) {
    const navigate = useNavigate();

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                <div className="logout-header">
                    <TbLogout2 className="logout-icon" />

                </div>
                <h3 className="delete-title">Are You sure you want to Logout ?</h3>
                <div className="btn_group">
                    <button type="button" className="modal-cls" onClick={onClose}>
                        No
                    </button>
                    <button type="button" className="modal-save" onClick={() => {
                        localStorage.clear();
                        navigate('/');
                    }}>
                        Yes
                    </button>
                </div>
            </div>


        </div>
    );
}

export default LogOut
