import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "@/lib/utils/axios";
import JobPostingForm from "@/components/forms/JobPostingForm";

export default function PostAdhocPage() {
  const navigate = useNavigate();

  const { mutate: createJob, isPending } = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.post("/jobs", data);
      return response;
    },
    onSuccess: () => {
      toast.success("Ad-hoc job posted successfully");
      navigate("/employer/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error posting ad-hoc job"
      );
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Post Ad-hoc Job</h1>
        <p className="text-muted-foreground">
          Create a new short-term job opportunity
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <JobPostingForm type="adhoc" onSubmit={createJob} />
      </div>
    </div>
  );
}
